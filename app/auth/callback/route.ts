/**
 * Auth Callback Route Handler
 * Handles OAuth callbacks, email confirmations, and password recovery
 *
 * NOTE: This route creates user profiles directly using serverSupabase
 * to avoid issues with nested fetch calls and missing cookies.
 */

import { AUTH_ROUTES } from "@/lib/constants/authConfig";
import { serverSupabase } from "@/lib/supabaseServer";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  // Check for password recovery type
  const type = requestUrl.searchParams.get("type");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore errors
            }
          },
        },
      }
    );

    // Exchange code for session
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (exchangeError) {
      console.error("Code exchange error:", exchangeError);
      return NextResponse.redirect(
        `${origin}${AUTH_ROUTES.LOGIN}?error=auth_failed`
      );
    }

    // If this is a password recovery, redirect to reset password page
    if (type === "recovery") {
      return NextResponse.redirect(`${origin}${AUTH_ROUTES.RESET_PASSWORD}`);
    }

    // Get the authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No user after code exchange");
      return NextResponse.redirect(
        `${origin}${AUTH_ROUTES.LOGIN}?error=no_user`
      );
    }

    console.log("Auth callback for user:", user.id, user.email);

    // Check if user profile exists in users table using service client
    const { data: existingUser, error: lookupError } = await serverSupabase
      .from("users")
      .select("id, role")
      .eq("auth_uid", user.id)
      .maybeSingle();

    if (lookupError) {
      console.error("User lookup error:", lookupError);
    }

    if (!existingUser) {
      // Create user profile directly using serverSupabase
      const userName =
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User";

      // All new users get 'basic' role by default
      const userRole = "basic";

      console.log("Creating user profile:", {
        auth_uid: user.id,
        email: user.email,
        name: userName,
        role: userRole,
      });

      const { data: newUser, error: insertError } = await serverSupabase
        .from("users")
        .insert({
          auth_uid: user.id,
          email: user.email,
          name: userName,
          role: userRole,
          email_verified: user.email_confirmed_at != null,
        })
        .select("*")
        .single();

      if (insertError) {
        console.error("Failed to create user profile:", insertError);
        // Still redirect to dashboard - profile may be created by trigger
        return NextResponse.redirect(
          `${origin}${AUTH_ROUTES.DASHBOARD}?error=profile_create_failed`
        );
      }

      console.log("Created user profile:", newUser);

      // New user - redirect to dashboard
      return NextResponse.redirect(`${origin}${AUTH_ROUTES.DASHBOARD}`);
    }

    console.log("Existing user found:", existingUser);

    // Existing user - redirect to dashboard
    return NextResponse.redirect(`${origin}${AUTH_ROUTES.DASHBOARD}`);
  }

  // No code - might be direct visit or email confirmation without code
  // Check if user is already authenticated
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return NextResponse.redirect(`${origin}${AUTH_ROUTES.DASHBOARD}`);
  }

  return NextResponse.redirect(`${origin}${AUTH_ROUTES.LOGIN}`);
}
