import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
export async function createGlobalAttributes(api: { post: (arg0: string, arg1: { create: { name: string; slug: string; }[]; }) => Promise<any>; }) {
  const attributes = await prisma.product_attribute.findMany({
    select:{
        name: true,
        slug: true,
        product_attributevalue:{
            select:{
                name:true,
                slug:true
            }
            
        }
    }
  })
  const globalAttributes = attributes.map(at => ({
    name: at.name,
    slug: at.slug
  }))

  api.post("products/attributes/batch", 
    {create:globalAttributes}
  )
  .then((response: any) => {
    // console.log(response.data);
  })
  .catch((error: { response: { data: any; }; }) => {
    console.log(error.response.data);
  });
}

export async function getGlobalAttributes(api: { get: (arg0: string) => any; }) {
  return api.get("products/attributes")
}
export async function updateAttributesTerms(api) {
  const attributes = await prisma.product_attribute.findMany({
    select:{
      name:true,
      slug:true,
      product_attributevalue:{
        select:{
          name:true,
          slug:true,
        }
      }
    }
  })
  api.get("products/attributes", {per_page:100}).then((response: { data: any; }) => {
    const wooAttributes = response.data
    wooAttributes.map((wAt: { slug: string; id: any; })=>{
      const attribute = attributes.find(at=> `pa_${at.slug}` == wAt.slug)
      const terms = attribute.product_attributevalue
      console.log(terms);

      api.post(`products/attributes/${wAt.id}/terms/batch`, {create:terms})
      .then((response: { data: any; }) => {
        console.log(response.data);
      })
      .catch((error: { response: { data: any; }; }) => {
        console.log(error.response.data);
      });
    })
  })
  .catch((error: { response: { data: any; }; }) => {
    console.log(error.response.data);
  });
}


