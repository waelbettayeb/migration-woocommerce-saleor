import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import {createGlobalAttributes, getGlobalAttributes, updateAttributesTerms} from "./Attributes";
import { createCategories, createCategoriesFromCollection, updateCollectionsImages, updateWooCategories } from "./Collections";
import { createProducts, updateProductsImages } from "./Products";
 
const api = new WooCommerceRestApi({
  url: "https://wc.ilyes-bijoux.com",
  consumerKey: "ck_0aae73b4afd201b0fbc4e8c9731ec0dc59f9a5d8",
  consumerSecret: "cs_6827c8bf37293e74a24a47a344628e39900a4d72",
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
  // .catch((error) => {
  //   console.log(error.response.data);
  // });

  // await createCategories(api)
  // await updateWooCategories(api)
  // await createCategoriesFromCollection(api)
  // await updateCollectionsImages(api)
  // await createProducts(api)
  await updateProductsImages(api)
  console.log("migration finished")
}

main()
