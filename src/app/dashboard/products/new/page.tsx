import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWithBackButton } from '../../_components/PageWithBackButton';
import { ProductDetailsForm } from '../../_components/form/ProductDetailsForm';

export default function NewProductPage() {
  return (
    <PageWithBackButton
      pageTitle="Create Product"
      backButtonHref="/dashboard/products"
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-xl"> Products details</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductDetailsForm />
        </CardContent>
      </Card>
    </PageWithBackButton>
  );
}
