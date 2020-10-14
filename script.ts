import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import {createGlobalAttributes, getGlobalAttributes, updateAttributesTerms} from "./Attributes";
import { createCategories, createCategoriesFromCollection, updateWooCategories } from "./Collections";
 
const api = new WooCommerceRestApi({
  url: "http://localhost",
  consumerKey: "ck_faeb8f19c95a0e07a6c2ee710fe0347d31511bd6",
  consumerSecret: "cs_1c8d4c6dad0d5ac15850f041d77cd19c02840b8e",
  version: "wc/v3",
  port:8080
});

const prisma = new PrismaClient();

console.log("Migration started!");

async function main() {

  // createGlobalAttributes(api)
  
  // getGlobalAttributes(api).then((response) => {

  //   console.log(response.data);
  // })
  // .catch((error) => {
  //   console.log(error.response.data);
  // });

  // updateAttributesTerms(api)
  // createCategories(api)
  // updateWooCategories(api)
  // createCategoriesFromCollection(api)
  
}

main()
