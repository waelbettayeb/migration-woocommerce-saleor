import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { createGlobalAttributes, getGlobalAttributes, updateAttributesTerms } from "./Attributes";
import { createCategories, createCategoriesFromCollection, updateCollectionsImages, updateWooCategories } from "./Collections";
import { createProducts, createVariants, updateProductsImages, updateStockQuantity } from "./Products";

const api = new WooCommerceRestApi({
  url: "https://ilyes-bijoux.com",
  consumerKey: "ck_c54f16a49c44ed957652a48b6fcbea62000d300c",
  consumerSecret: "cs_db4fb04644bd8865c4626f9379bd57a0469d4670",
  version: "wc/v3",
  queryStringAuth: true
});

const prisma = new PrismaClient();

console.log("Migration started!");

async function main() {

  // await createGlobalAttributes(api)
  // await updateAttributesTerms(api)

  // await getGlobalAttributes(api).then((response) => {
  //   console.log(response.data);
  // })
  //   .catch((error) => {
  //     console.log(error.response.data);
  //   });

  // await createCategories(api)
  // await updateWooCategories(api)
  // await createCategoriesFromCollection(api)
  // await updateCollectionsImages(api)
  // await createProducts(api)
  // await updateProductsImages(api)
  // await createVariants(api)
  // await updateStockQuantity(api)
  console.log("migration finished")
  try {
    const response = await api.get(`products/3613`)
    const product = response.data
    console.log(product)
  } catch (error) {
    console.log(error.data)
    
  }
}

main()
