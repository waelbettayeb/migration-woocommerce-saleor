import { PrismaClient, product_category } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
export async function createCategories(api) {

  const categories = await prisma.product_category.findMany({
    select:{
      name:true,
      slug:true,
    }
  })
  const wooCategories = categories.map(cat => {
    return {
      name: cat.name,
      slug: cat.slug,
  }})
  console.log(wooCategories.length)
  await api.post("products/categories/batch", 
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
      background_image:true,
      product_category:{select:{slug: true, name:true}}
    }
  })
  try {
      const response = await api.get("products/categories", {
        per_page: 100
      })
      const wooCategories = response.data;
      const wooCategoriesWithParents = wooCategories.map( c => {
        const category = categories.find(cat => c.slug == cat.slug)
        const parentSlug = category?.product_category?.slug
        const url =  category?.background_image? `${process.env.ASSETS_ENDPOINT}${category?.background_image}` : undefined

        const parentId = parentSlug? wooCategories.find(cat => cat.slug == parentSlug)?.id : 0
        return {...c, parent: parentId, image:{
          src:url
        }}
      })
      await api.post("products/categories/batch", 
      {
        update: wooCategoriesWithParents
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error.response.data);
      });
  }catch(error){
    console.error(error)
  }
  
}
export async function createCategoriesFromCollection(api) {

  const collections = await prisma.product_collection.findMany({
    select:{
      name:true,
      slug:true,
    }
  })
  const wooCategories = collections.map(cat => {
    return {
      name: cat.name,
      slug: cat.slug,
  }})

  await api.post("products/categories/batch", 
    {create:wooCategories}
  )
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });
}
export async function updateCollectionsImages(api){
  const collections = await prisma.product_collection.findMany({
    select:{
      name:true,
      slug:true,
      background_image:true
    }
  })
  const response = await api.get("products/categories", {
    per_page: 100
  })
  const wooCategories = response.data
  const data = wooCategories.map(wcat => {
    const category = collections.find(c => c.slug == wcat.slug || c.name == wcat.name)
    const url =  !(wcat.image)&&category?.background_image? `${process.env.ASSETS_ENDPOINT}${category?.background_image}` : undefined
    return url&&{id: wcat.id, image: {src: url}}
  })
  console.log(data)
  await api.post("products/categories/batch", 
    {update:data}
  )
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.log(error.response.data);
  });

}