import { PrismaClient, product_category } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
export async function createCategories(api) {

  const categories = await prisma.product_category.findMany({
    select:{
      name:true,
      slug:true,
      background_image:true,
    }
  })
  const wooCategories = categories.map(cat => {
    const url =  cat.background_image? `${process.env.ASSETS_ENDPOINT}${cat.background_image}` : null
    return url&&process.env.IMPORT_IMAGES?{
      name: cat.name,
      slug: cat.slug,
      image: {
        src: url
      }
    }:{
      name: cat.name,
      slug: cat.slug,
  }})
  console.log(wooCategories)
  api.post("products/categories/batch", 
    {create:wooCategories}
  )
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
}

//update parents id
export async function updateWooCategories(api) {
  const categories = await prisma.product_category.findMany({
    select:{
      name:true,
      slug:true,
      product_category:{select:{slug: true, name:true}}
    }
  })
  api.get("products/categories", {
    per_page: 100
  })
  .then((response) => {
    const wooCategories = response.data;
    const wooCategoriesWithParents = wooCategories.map( c => {
      const parentSlug = categories.find(cat => c.slug == cat.slug)?.product_category?.slug
      const parentId = parentSlug? wooCategories.find(cat => cat.slug == parentSlug).id : 0
      return {...c, parent: parentId}
    })
    
    api.post("products/categories/batch", 
    {
      update: wooCategoriesWithParents
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.log(error.response.data);
    });
  })
  .catch((error) => {
    console.log(error.response.data);
  });
}
export async function createCategoriesFromCollection(api) {

  const collections = await prisma.product_collection.findMany({
    select:{
      name:true,
      slug:true,
      background_image:true,
    }
  })
  const wooCategories = collections.map(cat => {
    const url =  cat.background_image? `${process.env.ASSETS_ENDPOINT}${cat.background_image}` : null
    return url&&process.env.IMPORT_IMAGES?{
      name: cat.name,
      slug: cat.slug,
      image: {
        src: url
      }
    }:{
      name: cat.name,
      slug: cat.slug,
  }})

  api.post("products/categories/batch", 
    {create:wooCategories}
  )
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
}