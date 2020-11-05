import { PrismaClient, product_category } from "@prisma/client";
import * as dotenv from "dotenv";
dotenv.config();

const prisma = new PrismaClient();
export async function createProducts(api) {
  const response = await api.get("products/categories", {
    per_page: 100
  });
  const wooCategories: any[] = response.data
  const products = await prisma.product_product.findMany({
    select:{
      name:true,
      seo_description:true,
      price_amount:true,
      slug:true,
      is_published:true,
      product_assignedproductattribute:{
        select:{
          product_attributeproduct:{
            select:{
              product_attribute:{
                select:{
                  name:true
                }
              }
            }
          },
          product_assignedproductattribute_values:{
            select:{
              product_attributevalue:{
                select:{
                  name:true,
                  product_attribute:{
                    select:{
                      name:true
                    }
                  }
                }
              }
            }
          }
        }
      },
      product_productimage:{
        select:{
          image:true,
          sort_order:true
        }
      },
      product_category:{
        select:{
          slug:true,
        }
      },
      product_collectionproduct:{
        select:{
          product_collection:{
            select:{
              slug:true
            }
          }
        }
      },
      product_productvariant:{
        select:{
          name:true,
          sku:true,
          price_override_amount:true,
          track_inventory:true,
          warehouse_stock:{
            select:{
              quantity:true
            }
          },
          product_assignedvariantattribute:{
            select:{
              product_assignedvariantattribute_values:{
                select:{
                  product_attributevalue:{
                    select:{
                      name:true,
                      product_attribute:{
                        select:{
                          name:true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
        }
      },
      product_producttype:{
        select:{
          name:true,
          has_variants:true,
          product_attributevariant:{
            select:{
              product_attribute:{
                select:{
                  name:true,
                  product_attributevalue:{
                    select:{
                      name:true,
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  
  const data = products.map(p => {
    const sCategories = p.product_collectionproduct.map(c => ({slug: c.product_collection.slug})).concat({slug: p.product_category.slug})
    const categories = wooCategories.filter(c => sCategories.filter(sC => sC.slug == c.slug).length > 0)
    const productAttributes = p.product_assignedproductattribute.map(at =>( {
      variation: false,
      visible: true,
      name: at.product_attributeproduct.product_attribute.name,
      options: [at.product_assignedproductattribute_values[0]?.product_attributevalue.name]
    }))
    const variationAttributes = !p.product_producttype.has_variants? undefined : p.product_producttype.product_attributevariant.map(at =>( {
      variation: true,
      visible: false,
      name: at.product_attribute.name,
      options: at.product_attribute.product_attributevalue.map(option => option.name)
    }))
    return {
      name: p.name,
      slug: p.slug,
      type: p.product_producttype.has_variants? 'variable': 'simple',
      description: p.seo_description,
      sku: p.product_producttype.has_variants? undefined : p.product_productvariant[0]?.sku,
      regular_price: p.product_producttype.has_variants? undefined : p.price_amount,
      manage_stock: !p.product_producttype.has_variants,
      stock_quantity: p.product_producttype.has_variants? undefined : p.product_productvariant[0]?.warehouse_stock[0]?.quantity,
      tax_status: 'none',
      categories,
      attributes: productAttributes.concat(variationAttributes),
    }
  })
  for (let index = 0; index < data.length; index +=100) {
    try{
      const response = await api.post("products/batch", {create: data.slice(index, index+100)})
      const wooProducts = response.data.create
      wooProducts.map(wProduct =>
        {
          if(wProduct.type == 'variable'){
            const product = products.find(p => p.slug == wProduct.slug)
            const vData = product.product_productvariant?.map(variant => ({
              sku: variant.sku,
              regular_price: variant.price_override_amount? variant.price_override_amount:product.price_amount,
              tax_status: 'none',
              manage_stock: true,
              stock_quantity: variant.warehouse_stock[0]?.quantity,
              attributes: variant.product_assignedvariantattribute.map(at => ({
                name: at.product_assignedvariantattribute_values[0].product_attributevalue.product_attribute.name,
                option: at.product_assignedvariantattribute_values[0].product_attributevalue.name
              }))
            }))
            api.post(`products/${wProduct.id}/variations/batch`, {
              create: vData
            })
            .then((response) => {
              // console.log(response.data);
            })
            .catch((error) => {
              console.error(error.error);
            });
            
          }
          return null
        }
        )
      }catch(error){
        console.log(error.response)
      }
    }
  }
  export async function updateProductsImages(api){
    const offset = 10
    const products = await prisma.product_product.findMany({
      select:{
        name:true,
        slug:true,
        product_productimage:{
          select:{
            image:true,
            sort_order:true
          }
        },
        product_productvariant:{
          select:{
            name:true,
            sku:true,
          },
        },
      }
    })
    for (let index = 0; index < 1300; index+= offset) {
      try{
        const response = await api.get("products", {
          per_page: offset,
          offset: index
        })
        const wooProducts = response.data
        const data = wooProducts.map(wp => {
          if(!wp.images.length){
            const product = products?.find(pd => pd.slug == wp.slug)
            const images = product?.product_productimage?.sort((a, b) => a.sort_order - b.sort_order ).map(img => ({src: `${process.env.ASSETS_ENDPOINT}${img.image}`}))
            return {id: wp.id, images}
          }
          return {id: wp.id}
        })
        console.log(`index: ${index}`);
        await api.post("products/batch", {update: data})
        .then((response) => {
          // console.log(response.data);
        })
        .catch((error) => {
          console.log(error.data);
        });
      }catch(response){
        console.log(response.error)
      }
    }
  }
  
  export async function createVariants(api) {
    const products = await prisma.product_product.findMany({
      select:{
        name:true,
        seo_description:true,
        price_amount:true,
        slug:true,
        is_published:true,
        product_assignedproductattribute:{
          select:{
            product_attributeproduct:{
              select:{
                product_attribute:{
                  select:{
                    name:true
                  }
                }
              }
            },
            product_assignedproductattribute_values:{
              select:{
                product_attributevalue:{
                  select:{
                    name:true,
                    product_attribute:{
                      select:{
                        name:true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        product_productvariant:{
          select:{
            name:true,
            sku:true,
            price_override_amount:true,
            track_inventory:true,
            warehouse_stock:{
              select:{
                quantity:true
              }
            },
            product_assignedvariantattribute:{
              select:{
                product_assignedvariantattribute_values:{
                  select:{
                    product_attributevalue:{
                      select:{
                        name:true,
                        product_attribute:{
                          select:{
                            name:true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
          }
        },
        product_producttype:{
          select:{
            name:true,
            has_variants:true,
            product_attributevariant:{
              select:{
                product_attribute:{
                  select:{
                    name:true,
                    product_attributevalue:{
                      select:{
                        name:true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
    for (let index = 0; index < 1300; index +=100) {
      try{
        const response = await api.get("products", { per_page: 100 , offset: index})
        const wooProducts = response.data
        for (let k = 0; k < wooProducts.length ; k +=1) {
          const wProduct = wooProducts[k]
          if(wProduct.variations.length == 0 && wProduct.type == 'variable'){
            const product = products.find(p => p.slug == wProduct.slug)
            const vData = product.product_productvariant?.map(variant => ({
              sku: '0'+ variant.sku,
              regular_price: variant.price_override_amount? variant.price_override_amount:product.price_amount,
              tax_status: 'none',
              manage_stock: true,
              stock_quantity: variant.warehouse_stock[0]?.quantity,
              attributes: variant.product_assignedvariantattribute.map(at => ({
                name: at.product_assignedvariantattribute_values[0].product_attributevalue.product_attribute.name,
                option: at.product_assignedvariantattribute_values[0].product_attributevalue.name
              }))
            }))
            await api.post(`products/${wProduct.id}/variations/batch`, {
              create: vData
            })
            .then((response) => {
              console.log(response.data);
            })
            .catch((error) => {
              console.error(error.response.error);
            });
          }
        }
      }catch(error){
        console.log('error', error.response.data)
      }
    }
  }
  
  
  
  export async function updateStockQuantity(api) {
    const products = await prisma.product_product.findMany({
      select:{
        name:true,
        seo_description:true,
        price_amount:true,
        slug:true,
        is_published:true,
        product_assignedproductattribute:{
          select:{
            product_attributeproduct:{
              select:{
                product_attribute:{
                  select:{
                    name:true
                  }
                }
              }
            },
            product_assignedproductattribute_values:{
              select:{
                product_attributevalue:{
                  select:{
                    name:true,
                    product_attribute:{
                      select:{
                        name:true
                      }
                    }
                  }
                }
              }
            }
          }
        },
        product_productvariant:{
          select:{
            name:true,
            sku:true,
            price_override_amount:true,
            track_inventory:true,
            warehouse_stock:{
              select:{
                quantity:true
              }
            },
            product_assignedvariantattribute:{
              select:{
                product_assignedvariantattribute_values:{
                  select:{
                    product_attributevalue:{
                      select:{
                        name:true,
                        product_attribute:{
                          select:{
                            name:true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
          }
        },
        product_producttype:{
          select:{
            name:true,
            has_variants:true,
            product_attributevariant:{
              select:{
                product_attribute:{
                  select:{
                    name:true,
                    product_attributevalue:{
                      select:{
                        name:true,
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
    for (let index = 0; index < 1300; index +=100) {
      try{
        const response = await api.get("products", { per_page: 100 , offset: index})
        const wooProducts = response.data
        for (let k = 0; k < wooProducts.length ; k +=1) {
          const wProduct = wooProducts[k]
          const product = products.find(p => p.slug == wProduct.slug)
          if( wProduct.type == 'variable'){
            const wooVariants = (await api.get(`products/${wProduct.id}/variations`, {per_page: 100})).data
            
            const vData = product.product_productvariant?.map(variant => {
              const wooVariant = wooVariants.find( wv=> wv.sku == variant.sku)
              return wooVariant&&{
                id: wooVariant.id,
                stock_quantity: variant.warehouse_stock[0]?.quantity,
              }
            })
            await api.post(`products/${wProduct.id}/variations/batch`, {
              update: vData
            })
            .then((response) => {
              // console.log(response.data);
            })
            .catch((error) => {
              console.error(error.response.error);
            });
          }
          else{
            const data = {
              id: wProduct.id,
              stock_quantity: product.product_productvariant[0].warehouse_stock[0]?.quantity,
            }
            await api.put(`products/${wProduct.id}`, data)
            .then((response) => {
              // console.log(response.data);
            })
            .catch((error) => {
              console.log(error.response.error);
            });
          }
        }
      }catch(error){
        console.log('error', error.response.error)
      }
    }
  }