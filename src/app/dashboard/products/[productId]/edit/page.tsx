import { CountryDiscountsForm } from '@/app/dashboard/_components/form/CountryDiscountsForm';
import { ProductCustomizationForm } from '@/app/dashboard/_components/form/ProductCustomizationForm';

import { ProductDetailsForm } from '@/app/dashboard/_components/form/ProductDetailsForm';
import { PageWithBackButton } from '@/app/dashboard/_components/PageWithBackButton';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getProduct,
  getProductCountryGroups,
  getProductCustomization,
} from '@/server/db/product';
import { canCustomizeBanner, canRemoveBranding } from '@/server/permisson';
// import { canCustomizeBanner, canRemoveBranding } from '@/server/permisson';
import { auth } from '@clerk/nextjs/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { notFound } from 'next/navigation';

export default async function EditPage({
  params: { productId },
  searchParams,
}: {
  params: { productId: string };
  searchParams?: { tab?: string };
}) {
  const { userId, redirectToSignIn } = await auth();
  if (!userId) return redirectToSignIn();

  const product = await getProduct({ id: productId, userId });
  if (product == null) return notFound();

  const tab = searchParams?.tab || 'details';

  return (
    <>
      <PageWithBackButton
        backButtonHref="/dashboard/products"
        pageTitle="Edit Product"
      >
        <Tabs defaultValue={tab}>
          <TabsList className="bg-background/60 p-2">
            <TabsTrigger value="details" className="p-2">
              Details
            </TabsTrigger>
            <TabsTrigger value="countries" className="p-2">
              Country
            </TabsTrigger>
            <TabsTrigger value="customization" className="p-2">
              Customization
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <DetailsTab product={product} />
          </TabsContent>
          <TabsContent value="countries">
            <CountryTab userId={userId} productId={productId} />
          </TabsContent>
          <TabsContent value="customization">
            <CustomizationsTab productId={productId} userId={userId} />
          </TabsContent>
        </Tabs>
      </PageWithBackButton>
    </>
  );
}

function DetailsTab({
  product,
}: {
  product: {
    id: string;
    name: string;
    description: string | null;
    url: string;
  };
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Product Details</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductDetailsForm product={product} />
      </CardContent>
    </Card>
  );
}

async function CountryTab({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) {
  const countryGroups = await getProductCountryGroups({
    productId,
    userId,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Country Discounts</CardTitle>
        <CardDescription>
          Leave the discount field blank if you do not want to display deals for
          any specific parity group.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CountryDiscountsForm
          productId={productId}
          countryGroups={countryGroups}
        />
      </CardContent>
    </Card>
  );
}

async function CustomizationsTab({
  productId,
  userId,
}: {
  productId: string;
  userId: string;
}) {
  const customization = await getProductCustomization({ productId, userId });

  if (customization == null) return notFound();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Banner Customization</CardTitle>
      </CardHeader>
      <CardContent>
        <ProductCustomizationForm
          canRemoveBranding={await canRemoveBranding(userId)}
          canCustomizeBanner={(await canCustomizeBanner(userId)) || true}
          customization={customization}
        />
      </CardContent>
    </Card>
  );
}
