'use server';

import {
  productCountryDiscountsSchema,
  productCustomizationSchema,
  productDetailSchema,
} from '@/schema/products';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import {
  createProduct as createProductDb,
  deleteProduct as deleteProductDb,
  updateProduct as updateProductDb,
  updateCountryDiscountsDb as updateCountryDiscountsDb,
  updateProductCustomization as updateProductCustomizationDb,
} from '@/server/db/product';
import { redirect } from 'next/navigation';
import { canCustomizeBanner } from '../permisson';

export async function createProduct(
  unsafeData: z.infer<typeof productDetailSchema>
): Promise<{ error: boolean; message: string } | undefined> {
  const { userId } = await auth();
  const { success, data } = productDetailSchema.safeParse(unsafeData);

  if (!success || userId == null) {
    return {
      error: true,
      message: 'There was an  error creating your Project',
    };
  }
  const { id } = await createProductDb({ ...data, clerkUserId: userId });
  redirect(`/dashboard/products/${id}/edit?tab=countries`);
}

export async function updateProduct(
  id: string,
  unsafeData: z.infer<typeof productDetailSchema>
): Promise<{ error: boolean; message: string } | undefined> {
  const { userId } = await auth();
  const { success, data } = productDetailSchema.safeParse(unsafeData);
  const Errormessage = 'There was an  error updating your Project';

  if (!success || userId == null) {
    return {
      error: true,
      message: Errormessage,
    };
  }
  const isSuccess = await updateProductDb(data, { id, userId });

  return {
    error: !isSuccess,
    message: isSuccess ? 'Product details updated' : Errormessage,
  };
}

export async function deleteProduct(id: string) {
  const { userId } = await auth();
  const errorMessage = 'There was an error deleting your product';

  if (userId == null) {
    return { error: true, message: errorMessage };
  }

  const isSuccess = await deleteProductDb({ id, userId });

  return {
    error: !isSuccess,
    message: isSuccess ? 'Successfully deleted your product' : errorMessage,
  };
}

export async function updateCountryDiscounts(
  id: string,
  unsafeData: z.infer<typeof productCountryDiscountsSchema>
) {
  const { userId } = await auth();
  const { success, data } = productCountryDiscountsSchema.safeParse(unsafeData);

  if (!success || userId == null) {
    return {
      error: true,
      message: 'There was an error saving your country discounts',
    };
  }

  const insert: {
    countryGroupId: string;
    productId: string;
    coupon: string;
    discountPercentage: number;
  }[] = [];
  const deleteIds: { countryGroupId: string }[] = [];

  data.groups.forEach((group) => {
    if (
      group.coupon != null &&
      group.coupon.length > 0 &&
      group.discountPercentage != null &&
      group.discountPercentage > 0
    ) {
      insert.push({
        countryGroupId: group.countryGroupId,
        coupon: group.coupon,
        discountPercentage: group.discountPercentage / 100,
        productId: id,
      });
    } else {
      deleteIds.push({ countryGroupId: group.countryGroupId });
    }
  });

  await updateCountryDiscountsDb(deleteIds, insert, { productId: id, userId });

  return { error: false, message: 'Country discounts saved' };
}

export async function updateProductCustomization(
  id: string,
  unsafeData: z.infer<typeof productCustomizationSchema>
) {
  const { userId } = await auth();
  const { success, data } = productCustomizationSchema.safeParse(unsafeData);
  const canCustomize = await canCustomizeBanner(userId);

  if (!success || userId == null || !canCustomize) {
    return {
      error: true,
      message: 'There was an error updating your banner',
    };
  }

  await updateProductCustomizationDb(data, { productId: id, userId });

  return { error: false, message: 'Banner updated' };
}
