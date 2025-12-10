import React from 'react';
import { Row } from 'react-bootstrap';
import StotraCard from '@/components/StotraCard';
import { getCategoryContext } from '@/utils/stotraUtils';

interface StotrasGridProps {
  stotras: any[];
  locale: string;
}

const StotrasGrid: React.FC<StotrasGridProps> = ({ stotras, locale }) => {
  return (
    <Row className="g-4 mt-3">
      {stotras.map(stotra => {
        const categoryContext = getCategoryContext(stotra);
        return (
          <StotraCard
            key={stotra.canonicalSlug}
            stotra={stotra}
            locale={locale}
            showCanonicalSlug={true}
            categoryContext={categoryContext}
          />
        );
      })}
    </Row>
  );
};

export default StotrasGrid;