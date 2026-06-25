import { Product, Collection, Testimonial, Brand } from "@/types/shopify";

export const mockCollections: Collection[] = [
  {
    id: "col_1",
    title: "Dog Food",
    handle: "dog-food",
    description: "Nutritious and delicious dry dog food, rich feeds, and dry kibbles.",
    image: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBl1KRtcbuA_02p6ue-q34xXugmv6git9xVlHLkiVnp2QhdApzDm7fWbftV-t2AlwOm-Ot-ilUes7mAQa_nlhF83O3nQOr8nHrpExVmpvcnHWbzTGYPshDR0V3bvcTF-ZZ4aAezqEAqy-Vhko30W9BqGbV2mAp-Tf8uT_M-h91QiXIorEYLie-M8S1MilpIw2g1rxg5cAUNdIOZGL6rd1MTfsyxzN9KKXQcmjj-_8xFIzr1Q41MiCto6LmhghGdelsNE6094BZcQdI",
      altText: "Premium dry dog food bowl"
    }
  },
  {
    id: "col_2",
    title: "Cat Food",
    handle: "cat-food",
    description: "Highly digestive cat formulas and dry selection.",
    image: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDM3LKtO9X9thQ5XHTj5McGnI9I4LzK2SYUZ6fQ5-_b93_0hZfM6Wfr41UrbHv5HFUmb1B9Myvgjsxd5rEeLPeKag6P91Gp8EeQE8dsdNzBV48DLtQ0NP8rSLiTxMhxZgs_al1uxcHB1j-b-6-qZvbk5GCefapYDv3xFY30rBBaJn3JT4ujBO9vVHBWaNRt-okErAOlTDorjT7IZmn7Qu_3OzeJs03KxgPZhOlSGA-xBS0TPng8V0myYssuAjE7vTitUPWNSqbvhsc",
      altText: "Adult cat eating food selection"
    }
  },
  {
    id: "col_3",
    title: "Toys",
    handle: "toys",
    description: "Durable cotton rope and chew toys for active dogs.",
    image: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB68KhJ8lC0lzLS0sNdRUj8XSDEjp1P9rO7j4c5hcseclRnp0sjo1fwx-jBpapCUPyORV6kl2GtkRMHaOGHKXuGXv2_yyYnrzYk4BVHk9uszNaZp25sCw5Hxs4JJvN6XLozmkjSDbKfZnhgkDSpN3gaJKmuTYWt3_G2I7H-bKPzgvBJyWfzzymtKwBOqSZ1MPuh_2-zz1L6lDCFS9YZO9tn4c5opN5Z9OHM7gz_FVQEHk8nCPV2v9O6H-LCshniswU8wEieY_xVCYA",
      altText: "Handmande dog hemp cotton toys"
    }
  },
  {
    id: "col_4",
    title: "Accessories",
    handle: "accessories",
    description: "Luxury handcrafted leather wear and ergonomic items.",
    image: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB0jEj1pMRvDpwJYrlSRrXYzUgd36VJCaJ_1-xGjoM3OG4HN8hVo4KkjwipCa2sjXeloAuTnTv6O8IzWheJQKT4SZOFtaK-TC_Al3BSZmY3sVv7CfVfWB_VZsAXrHkfZM3kJrrxxeEqHFnhxVH0Tw4cY36qfEduQwWUqajTiStVhBihhaucvmKbijqQ-jeXRGJI2yswJrj-tsB7yOGOj2QQJFuD5g567MgOoWqRm5UVTsfA1mdLgGGWOWK9tqEMW4UWKHnfvGIkjHM",
      altText: "Boutique leather pet collars and harnesses"
    }
  }
];

export const mockProducts: Product[] = [
  {
    id: "prod_1",
    title: "Artisanal Beef Liver Bites",
    handle: "artisanal-beef-liver-bites",
    description: "All-natural, grain-free premium training treats made with 100% dehydrated grass-fed beef liver.",
    vendor: "Don Perro",
    productType: "Organic Food",
    tags: ["best-seller", "treats", "organic", "dog"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAm5QB1jVE4kMaNzKFCFaRvuGMoU9pF2BZXtXpQt2D7slejf1WsPhP_WrJwkkYhqomOtXG7FrfcTizqiZI5xefgNxdunjeRj_rJ9OywqrNXieV9LsNhbqbUSbSitYZhsBWWJMtjXO6Fl7vYi7u2qaPh8PVRPglGo38Fatlz2_3lZ--IA6KqB4jXpX5ISemJD5DMiU-0fSbnHsoPBIDqU49SWljQCoEx8Pnja9H3P91EN_zApHF7_CM5Vex61xh6MfkAl4c2errOTyU",
      altText: "Jar of artisanal beef liver dog treats"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "24.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_1_1",
        title: "Standard Jar",
        availableForSale: true,
        price: { amount: "24.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_2",
    title: "Ergonomic Ceramic Bowl",
    handle: "ergonomic-ceramic-bowl",
    description: "Designed at a perfect tilt and elevated height to protect your pet's spine and enhance digestion.",
    vendor: "Don Perro",
    productType: "Beds & Comfort",
    tags: ["best-seller", "dining", "bowl", "dog", "cat", "sale"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA44SC1pTLHqxOppzpo41ZbeY8yK9f0CoWwakQXzmj-Dhgg1XkdfJnrSCXhl9GGTtBjccwoQ2z5uw6hV8bZbIG2INkm8VQfmluh0JucwBn5XaGFNVw6rarrJWvYj5WjQWrpI1PfqtFRzCKZp-0yURKUKBqMpqkjT7YCeg1zTwjxdL85Uvc7BBr3UY-C_Nie9S0pzvZE4AMMTF3XLic3U47Aju7E8f0pzxSP1yTaKrtYlNGBmfo5Z3FL2emwW9Vuep28_EEIa3ZyjbY",
      altText: "Sage green tilted ceramic dog bowl"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "28.00", currencyCode: "USD" }
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "35.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_2_1",
        title: "Sage Green - Medium",
        availableForSale: true,
        price: { amount: "28.00", currencyCode: "USD" },
        compareAtPrice: { amount: "35.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_3",
    title: "Signature Leather Harness",
    handle: "signature-leather-harness",
    description: "Individually handcrafted premium oil-waxed leather harness with brass fixtures for exceptional security and class.",
    vendor: "Don Perro",
    productType: "Beds & Comfort",
    tags: ["best-seller", "accessories", "leather", "harness", "dog"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAs4oX1Wltp71y-a9Htk4spmvsdu_VO8lbM9h0RZ9AbiE8Jj0zSo2uqitBS5LIyfavDa4FLW0yftkRRc9ez0_g5ACMYbqpnzFfKpOyoNslizn5O3qJFMSutB3HMoZWTX4J0-zbU6k1J7gMUiAZUQnqMRE1vXy4neTxozdhgaSxzg8-tjdc6PYVZpgh2jNm0DOCpB6IYhH4P_eHVTvAvmUD6RZmBO4-Fj_sFbKStB-e8N9xzPVLOBjP82kDAx0z_7fRQfmRRT7OzBS0",
      altText: "Handmade leather harness with brass loops"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "65.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_3_1",
        title: "Chestnut Brown - L",
        availableForSale: true,
        price: { amount: "65.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_4",
    title: "Hemp Rope Toy Set",
    handle: "hemp-rope-toy-set",
    description: "Naturally antibacterial core cotton-hemp blend toys, perfectly safe and robust for prolonged chewing.",
    vendor: "Don Perro",
    productType: "Interactive Toys",
    tags: ["best-seller", "toys", "rope", "eco-friendly", "dog"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBcdl8D7WiYNSzSuaKLCPU_B2b3aTVZrgIKjpFhabrxeWqBEkz7qY8tuRbUmE3mRFrQSyPtXDFRKyZiO_c8-WeH1-6h25UjjthKsn4_YY0viBRsSjR-brFjH6SXZEkNIu9DKlU-0Iyj4wgBrBEIfax2KUrbr-cYhPfQm6UuPnKkR9YSPi-NpZw-iedWn0_Ogugi6W_ksbDtSo2-QeLhfvMfs_uVnsqTlzcB2wK-RXSIkti5BfoQrsyepLCgPumnoiQ0JkFxI4qLiio",
      altText: "Set of three structured hemp chewing rope shapes"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "32.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_4_1",
        title: "Pack of 3 Toys",
        availableForSale: true,
        price: { amount: "32.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_5",
    title: "Ultra-Comfort Orthopedic Bed",
    handle: "ultra-comfort-orthopedic-bed",
    description: "Premium memory foam base with ultra-plush side cushions, ensuring restful sleep for senior or active pups.",
    vendor: "Don Perro",
    productType: "Beds & Comfort",
    tags: ["featured", "comfort", "bed", "orthopedic", "dog"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGwNvhcyrG_7tSqbOSaQlmUameDvjbrsUjTjsQHIwepL5VZ876xmME5YW1v0Da4ozNU-ZHzsfT6vQ6pSlvbcTjonAiXpxzl50Y-5dvj7UCgSEhFFgyNDOqDzjhEGlx7YOMV2MI83FvAzsB9IsXqH1utKqM6wxPI91a9qXE3IjM4vE3Ny09KYTDpTbVVJnOzsdr31AtVwZ4OlxVXQMyc0L2PK8iSfpmNAjpwxl0CYAWFRwucP_WlE1oimSru-iF7zRXsLAJv5N30pE",
      altText: "Dog relaxing on a high quality orthopedic memory foam bed"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "120.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_5_1",
        title: "Standard Size",
        availableForSale: true,
        price: { amount: "120.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_6",
    title: "Artisan Leather Collar",
    handle: "artisan-leather-collar",
    description: "Luxury handcrafted leather wear customized for superior durability and a sleek polished fit.",
    vendor: "Don Perro",
    productType: "Beds & Comfort",
    tags: ["new", "accessories", "dog", "best-seller"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzmvdO2ciL-t-e-XA4k-K0CBgaeBhuK8MNd6CXlNi-f3OOIIh0PAyGxn0R-HPZ6WASHA8SBojBCba4igqHo_o004TMkuzGqf8Z9iMJqjiaGmIBtiMOct3rzVIMnQdCGM8kDOspjGhFaGYSZ0h-utwmLzpp-0t7SgE47tZabnxHNtstgRiPYoPoZJYV3gJUDonZUprw3ZnV_1YfNwqyzOP3K2gqEEhpxCIV0IchVkkycNDrl22NNo3KgOnTnEE5aBhFpLdJ6-sz68c",
      altText: "Artisan Leather Collar"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "75.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_6_1",
        title: "Artisan Leather Collar - Standard",
        availableForSale: true,
        price: { amount: "75.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_7",
    title: "Premium Salmon & Sweet Potato",
    handle: "premium-salmon-sweet-potato",
    description: "Our Premium Salmon & Sweet Potato formula is meticulously crafted for sensitive stomachs and high-energy needs. Using only wild-caught Alaskan salmon and locally sourced organic sweet potatoes, we ensure a nutrient-dense meal that promotes a shiny coat, healthy joints, and optimal digestion.",
    vendor: "Don Perro",
    productType: "Organic Food",
    tags: ["organic", "food", "dog", "best-seller", "new"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuLr3E3R77u0Sz9bSFhOgJzDnRjGDEnI2bn6m1zp9mwzBN39o3_K9T8uc6vAxfx1Ud0-c-sGXlptvrsokfvWV_4OV0QaSmCT3XyRLcXsUhwfUPV3WA6v4yyvaIJ4Q1RSYC0akQNzAnnOFjz2VkMf67mNIfFnsDuh0pQdvsGQznkAkmTHdZOB2BxPJkyPGDvDWoyw1qiT__4eaMB8OibNi117CYPCCGamfdnQVTRWaMXcOsU7lcvh21wQQ9pmlIG0osGNOFB60ylhA",
      altText: "Premium Salmon & Sweet Potato Dog Food bag"
    },
    images: [
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuLr3E3R77u0Sz9bSFhOgJzDnRjGDEnI2bn6m1zp9mwzBN39o3_K9T8uc6vAxfx1Ud0-c-sGXlptvrsokfvWV_4OV0QaSmCT3XyRLcXsUhwfUPV3WA6v4yyvaIJ4Q1RSYC0akQNzAnnOFjz2VkMf67mNIfFnsDuh0pQdvsGQznkAkmTHdZOB2BxPJkyPGDvDWoyw1qiT__4eaMB8OibNi117CYPCCGamfdnQVTRWaMXcOsU7lcvh21wQQ9pmlIG0osGNOFB60ylhA",
        altText: "Premium Salmon & Sweet Potato Dog Food bag"
      },
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmO2TZhgHzc60zxd8zx0yX_mUJnfu1loxARm-OwYlO5uz5a4SOOe2u_VvsI_7X7HeMnJqwlu1EJA6vRKSsvWHtkdFn6S2bWExQdUipX3jBQl0HjMnd6_OzXs8qTZednTNhSdBF1bQIdicmeoElZ6EmzSnDW9ImkS76n6im9lZp000lJhEsTHKcSjAnkGQv09Q559Ef4Qsdg9_IT-yU4FCMGqwPrLj5jmbqv8byXtOAMOFkaLbT5vm6JBBSCGItso3TyyqjdvMOXrs",
        altText: "Close up of texture and packaging"
      },
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJnHSRk5oFMYQg5WorM0GmMN_f_eUE00EDG5iE0Q9ZvSCUb-DPXPCeWnZxZmSIdloyUlWfdXjMrKwrxudLrMr814sQV8MyVEF-Mo63T-b-HW5ZSzNwj9KOhLIkHyqVC9sEyOhnQpkdCayc73piyM-bSuxpqXuB9J-VQPdL1JLBDYo0IduSJY0Hk8sKkBC1Zr6NA6vGJ_APm65bhfEPkBgOsL_K_eEywfEJ4eq5zoPMjIPuZPnsiPF0Gqt4ZhkGiitW0fvSEBtGDiw",
        altText: "Happy Golden Retriever patient by food bag"
      },
      {
        url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjTAQg_dMhlkKOmeGv-rmsuL3IBVj0aL1eVUtosbrYMs6fcCic98T5Q5KJpr23AeutR-ohvk__mw_v93IVhssAM8-ME4mrmrDhHlSwCoqoDlDrfTfNxPYg6K6xYU-CsquIFHMJOiec5L5ZLsPvuF5jPb_hvWhmI3_1Ea4o1JxlSX2TXTijpGAVkI6pfLOT5fMD_8tfhEDWmV8QwNAqwzgtIgSyf3OrdSpN8GdVrJnbXeIBeHgJsCRccMIyNr-6mNbxybQ_GXKLo04",
        altText: "Premium heart shaped kibble formulation"
      }
    ],
    priceRange: {
      minVariantPrice: { amount: "48.99", currencyCode: "USD" }
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "59.99", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_7_1",
        title: "5 lb",
        availableForSale: true,
        price: { amount: "48.99", currencyCode: "USD" },
        compareAtPrice: { amount: "59.99", currencyCode: "USD" }
      },
      {
        id: "var_7_2",
        title: "12 lb",
        availableForSale: true,
        price: { amount: "89.99", currencyCode: "USD" },
        compareAtPrice: { amount: "109.99", currencyCode: "USD" }
      },
      {
        id: "var_7_3",
        title: "25 lb",
        availableForSale: true,
        price: { amount: "149.99", currencyCode: "USD" },
        compareAtPrice: { amount: "179.99", currencyCode: "USD" }
      }
    ],
    rating: {
      value: 4.5,
      count: 128
    }
  },
  {
    id: "prod_8",
    title: "Minimalist Ceramic Bowl",
    handle: "minimalist-ceramic-bowl",
    description: "Elegant modern styled ceramic bowl aligned neatly on a robust high-end minimalist wooden stand.",
    vendor: "Don Perro",
    productType: "Beds & Comfort",
    tags: ["dining", "bowl", "dog", "cat"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoSvpVdy_AIz0nESYwRymTCyAELBZ73axlI0v3nty8C5tQzEFRUwk8h7MlOXC44qT6b73jg7lM-grRCAMkbnZrOVUmbRgjBuSyOB-KKgQzRE7Rj3YQ8iaMqoKHr2VPkqsvCoU7sWQkDa1qx2it65c4rtvGA9lPvvzlWXCjAqLxsg5D4Ffo2huEOCBmlthT3sHF0jhk2Ny54AiAqgKinHryNbFox8PJOwR6H13t--xFHJ7cOI4DketMaTm80tIxCDmSqNbHGUf1_Ew",
      altText: "Minimalist Ceramic Bowl"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "34.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_8_1",
        title: "Standard Bowl & Stand",
        availableForSale: true,
        price: { amount: "34.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_9",
    title: "Cloud Orthopedic Bed",
    handle: "cloud-orthopedic-bed",
    description: "Highly cushioned cloud comfort orthopedic bed providing essential heat dissipation and support.",
    vendor: "Don Perro",
    productType: "Beds & Comfort",
    tags: ["comfort", "bed", "dog", "sale", "featured"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGwNvhcyrG_7tSqbOSaQlmUameDvjbrsUjTjsQHIwepL5VZ876xmME5YW1v0Da4ozNU-ZHzsfT6vQ6pSlvbcTjonAiXpxzl50Y-5dvj7UCgSEhFFgyNDOqDzjhEGlx7YOMV2MI83FvAzsB9IsXqH1utKqM6wxPI91a9qXE3IjM4vE3Ny09KYTDpTbVVJnOzsdr31AtVwZ4OlxVXQMyc0L2PK8iSfpmNAjpwxl0CYAWFRwucP_WlE1oimSru-iF7zRXsLAJv5N30pE",
      altText: "Cloud Orthopedic Bed"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "89.00", currencyCode: "USD" }
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "120.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_9_1",
        title: "Standard Cloud Bed",
        availableForSale: true,
        price: { amount: "89.00", currencyCode: "USD" },
        compareAtPrice: { amount: "120.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_10",
    title: "Natural Hemp Tug Toy",
    handle: "natural-hemp-tug-toy",
    description: "Premium robust natural braided hemp rope crafted with love specifically for healthy chewing habits.",
    vendor: "Don Perro",
    productType: "Interactive Toys",
    tags: ["toys", "rope", "dog"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA_MKb8iIYDKxnVjZFsLoVFsIwm-L5U4azi_fbOqBM9JlWq4H0CGsIVUs3Pe9JRmhH5fSwquXrabPDFrXvW0SpiFI1pW1IkhqulHRsN22AlL--KG-JlLM4XnG3QEKEZKP1GyHsj06dr0gFx05TtMyJos61-qdgJ_AxVHrOI_JnSyWSXIpmlsdQRbanQxDiGyQWvWx1bUih9zyPjQTcMZgnQiLS7mUnKHMBGPJydZpkh4AtDoZSA5H65gcsanCVJbWPo2V-CtRHgeUw",
      altText: "Natural Hemp Tug Toy"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "18.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_10_1",
        title: "Standard Hemp Tug Toy",
        availableForSale: true,
        price: { amount: "18.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_11",
    title: "Bamboo Grooming Kit",
    handle: "bamboo-grooming-kit",
    description: "Organic professional bamboo-handled grooming brush accompanied by sensitive skin soothing wash oil.",
    vendor: "Don Perro",
    productType: "Supplements",
    tags: ["grooming", "brush", "dog", "cat"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFLncfSs4fiFBFPOZHq_VYZ5MfbR6AYwQ29LrED15og5D20_wyAiHZBVnnZPsyU6LTJen1lyocOlrSyy_Zk4NK-cUauttd-YdZCVE0ugA2eyKtSB_ykXYS8ElKNVf0Ow9dooF_XZ6EluKAMcHlmBB4LSjmUfnl36KmU0bE9T5bFSQWe4ekxIQWNRdNdUyxePqMIJ8mOFb6_VIxCW0OXJlf8JkJ8p6ZBzb1MZq21eyvQLqtUl0gR-0bRbOV8kAk5TwuqZRmZPs9SWY",
      altText: "Bamboo Grooming Kit"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "45.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_11_1",
        title: "Standard Grooming Kit",
        availableForSale: true,
        price: { amount: "45.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_12",
    title: "Organic Catnip Herb Blend",
    handle: "organic-catnip-herb-blend",
    description: "A super premium catnip herb harvested organically and rich in natural active compounds that feline lovers adore.",
    vendor: "Don Perro",
    productType: "Organic Food",
    tags: ["organic", "treats", "cat"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDM3LKtO9X9thQ5XHTj5McGnI9I4LzK2SYUZ6fQ5-_b93_0hZfM6Wfr41UrbHv5HFUmb1B9Myvgjsxd5rEeLPeKag6P91Gp8EeQE8dsdNzBV48DLtQ0NP8rSLiTxMhxZgs_al1uxcHB1j-b-6-qZvbk5GCefapYDv3xFY30rBBaJn3JT4ujBO9vVHBWaNRt-okErAOlTDorjT7IZmn7Qu_3OzeJs03KxgPZhOlSGA-xBS0TPng8V0myYssuAjE7vTitUPWNSqbvhsc",
      altText: "Premium Organic Catnip Herb Tin"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "12.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_12_1",
        title: "Single Premium Sachet",
        availableForSale: true,
        price: { amount: "12.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_13",
    title: "Wilderness Peak Organic Kibble",
    handle: "wilderness-peak-organic-kibble",
    description: "Premium organic dog kibble in a minimalist bag, boasting nutritious wholesome ingredients for longevity. Showcasing superior cold-pressed organic protein and ancestral superfoods.",
    vendor: "Don Perro",
    productType: "Dry Food",
    tags: ["organic", "dry-food", "dog", "kibble", "new", "health-organic"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuABueQ9lLv0uAbsMC1fKUE8shdYUOncxdw35HmsDkc0kGQNWHXZ73v4ezNbp6cjQVJWPCQ1n9-Ozz7Tms3eftVi6ga-yvS2ECnlZXnKT-dK3_9Q2qLNC3fV60JTKKMgWV-pIOGxNboP5JAKxaMMUxCsrRgXLkkHxKI50jWZFWS6729meiv2HMp1Tphbnz4M8XgmcP9ApQ_Lsus83wibzdVvY6_CPpv7SmOGCzW9WGn-pJfGVsq76VyohK_ji8GamZggIzoquuKjhh5x",
      altText: "Wilderness Peak Organic Kibble bag"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "45.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_13_1",
        title: "Standard Bag (10lb)",
        availableForSale: true,
        price: { amount: "45.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_14",
    title: "Harvest Heart Grain-Free Blend",
    handle: "harvest-heart-grain-free-blend",
    description: "Heartwarming dry food pellets shaped like hearts and circles in a ceramic bowl. Crisp taste, baked using wholesome farm-fresh grains, organic harvest vegetables, and real protein.",
    vendor: "Don Perro",
    productType: "Dry Food",
    tags: ["organic", "dry-food", "dog", "kibble", "grain-free", "health-organic", "health-grain-free"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDkytANyBvslQ4h8igwhvc1YNpYZGGM4cpByfS6u4pVuln5GGyBUstE_DRlhb3DgHgVI33xhoKKuO58bbBqEPfXxHEVrAZD4zDKyW_qzWCNl4yUoEVzX1EOvzcUDIpM1KkOT9IXZ8BYfrdAmGSQOq_6NCyZqbbvKwnKEDIOS1xuv0AIH6SL3AKvKGdyIAl1eQiBf-sxnw2ztpueITZ11kpPe0vNr0IADS9yzJiPioFOnb_6pMNIS31uPjpvzOuK_1Fy6wAyZcBwtu94",
      altText: "Harvest Heart Grain-Free Blend close-up"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "38.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_14_1",
        title: "Standard Bag (10lb)",
        availableForSale: true,
        price: { amount: "38.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_15",
    title: "Small Paws Puppy Vitality",
    handle: "small-paws-puppy-vitality",
    description: "Modern premium kibble formulated for developing growing puppies. Focused on clean ingredients and structural nutrients that ensure bone strength and cognitive spark.",
    vendor: "Don Perro",
    productType: "Dry Food",
    tags: ["puppy", "dry-food", "dog", "kibble", "sensitive-stomach", "health-sensitive"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA4ExZ0Zxb9O8-B-0N9WLSBz2kdKvVJecBD9kSFXwtqeiJDYZxjVPaxMhWlsuA-mFNfGpeNRMq_bnSWNjALipEgQn1uhhheYJgS7ss0_lmWFR41C8lnz63wMmpm8XcMlWbyIWCIKgy1iucph3vyzWIJGjhqR-0n2GnBek46OGPcPPe4lt4Zw4cjycmT5qFVo7d7L8Zrw4bBhPZmdfhvaGoRMQ5ZisV7sCOgT9YTgE4WMe3F92iaRiLR2mJwilxq2kyQD8VK4ZGAywTP",
      altText: "Small Paws Puppy Vitality bag"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "42.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_15_1",
        title: "Standard Bag (10lb)",
        availableForSale: true,
        price: { amount: "42.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_16",
    title: "Ocean Breeze Salmon Crunch",
    handle: "ocean-breeze-salmon-crunch",
    description: "Premium cold-water salmon formulation infused with garden sweet potatoes, rich in Omega-3 for an exceptionally glossy coat and healthy joints.",
    vendor: "Don Perro",
    productType: "Dry Food",
    tags: ["sale", "dry-food", "dog", "kibble", "salmon", "grain-free", "health-grain-free"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBipK9l1kGpBAsMpzL2Nq26ciPWTpCxHY-2VUbgvRKeZzzk8F0EDbxRcd_A0z5ZLPXiycQP_WCGesQRicNONm-AzwEOI3fyaJUhuefFEE3cKNCdjzMmHnJAx80io9WqA8P1rpEkKcw5lHTktkYyCdKTjV1D2BE6EQaEf9KM37NtFsqLYjaAfLJF4Z1dCtmvlQ2tHtghBxzLP1yw3A0flEfZjI-HE_4ai0axszvrhN30K-cLK0Tt1eIM5kC8SVJ4ekwbgzY2UQvThM3j",
      altText: "Ocean Breeze Salmon Crunch ingredients"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "49.00", currencyCode: "USD" }
    },
    compareAtPriceRange: {
      minVariantPrice: { amount: "60.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_16_1",
        title: "Standard Bag (12lb)",
        availableForSale: true,
        price: { amount: "49.00", currencyCode: "USD" },
        compareAtPrice: { amount: "60.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_17",
    title: "Peak Performance Adult Blend",
    handle: "peak-performance-adult-blend",
    description: "Sophisticated dry food formulated specifically to restore vitality, muscle density, and high-energy cellular recovery for active adult dogs.",
    vendor: "Don Perro",
    productType: "Dry Food",
    tags: ["active", "dry-food", "dog", "kibble", "sensitive-stomach", "health-sensitive"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDDNmrKMJPFTTkZl6CFtu_4oDSGSmdQOCuOkwYeve5gB23mptkall56I9ER0p0yAzZ3fhtrEHvJb6ul14oTrOf79xdjPo7FJL1o_2ObLDTfJCZyf-DwsfXKfIPKVuCrCU0qNJliW0RMqOqNt1dgtazc2DKBySiA2ZwJDmx_U45SUvQUygTDrGV-A8eh8k7wzzhWbrcqi0ArESWKEI5GB0kUtnKmQoq0z6gbem7HUDylTHEPe8mvXK5SC7tvpRElEvgGUuNyJh33FKbL",
      altText: "Peak Performance Adult Blend companion"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "55.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_17_1",
        title: "Standard Bag (10lb)",
        availableForSale: true,
        price: { amount: "55.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_18",
    title: "Slick Salmon Paté",
    handle: "slick-salmon-pate",
    description: "Tasty premium salmon paté canned with absolute care and high moisture content for optimal hydration.",
    vendor: "Don Perro",
    productType: "Wet Food",
    tags: ["wet-food", "dog", "salmon", "wet"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDM3LKtO9X9thQ5XHTj5McGnI9I4LzK2SYUZ6fQ5-_b93_0hZfM6Wfr41UrbHv5HFUmb1B9Myvgjsxd5rEeLPeKag6P91Gp8EeQE8dsdNzBV48DLtQ0NP8rSLiTxMhxZgs_al1uxcHB1j-b-6-qZvbk5GCefapYDv3xFY30rBBaJn3JT4ujBO9vVHBWaNRt-okErAOlTDorjT7IZmn7Qu_3OzeJs03KxgPZhOlSGA-xBS0TPng8V0myYssuAjE7vTitUPWNSqbvhsc",
      altText: "Slick Salmon Paté Can"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "12.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_18_1",
        title: "Standard Can",
        availableForSale: true,
        price: { amount: "12.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_19",
    title: "Organic Beef Wellington Purée",
    handle: "organic-beef-wellington-puree",
    description: "An elegant gourmet puréed dish prepared using 100% pasture raised grass-fed beef and wild mushrooms.",
    vendor: "Don Perro",
    productType: "Wet Food",
    tags: ["organic", "wet-food", "dog", "wet", "health-organic"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAm5QB1jVE4kMaNzKFCFaRvuGMoU9pF2BZXtXpQt2D7slejf1WsPhP_WrJwkkYhqomOtXG7FrfcTizqiZI5xefgNxdunjeRj_rJ9OywqrNXieV9LsNhbqbUSbSitYZhsBWWJMtjXO6Fl7vYi7u2qaPh8PVRPglGo38Fatlz2_3lZ--IA6KqB4jXpX5ISemJD5DMiU-0fSbnHsoPBIDqU49SWljQCoEx8Pnja9H3P91EN_zApHF7_CM5Vex61xh6MfkAl4c2errOTyU",
      altText: "Organic Beef Wellington Purée Can"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "15.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_19_1",
        title: "Standard Can",
        availableForSale: true,
        price: { amount: "15.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_20",
    title: "Country Turkey & Veggie Stew",
    handle: "country-turkey-veggie-stew",
    description: "Chunky premium turkey stew simmered slow with organic peas, sweet potatoes, and carrots.",
    vendor: "Don Perro",
    productType: "Wet Food",
    tags: ["wet-food", "dog", "wet"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFLncfSs4fiFBFPOZHq_VYZ5MfbR6AYwQ29LrED15og5D20_wyAiHZBVnnZPsyU6LTJen1lyocOlrSyy_Zk4NK-cUauttd-YdZCVE0ugA2eyKtSB_ykXYS8ElKNVf0Ow9dooF_XZ6EluKAMcHlmBB4LSjmUfnl36KmU0bE9T5bFSQWe4ekxIQWNRdNdUyxePqMIJ8mOFb6_VIxCW0OXJlf8JkJ8p6ZBzb1MZq21eyvQLqtUl0gR-0bRbOV8kAk5TwuqZRmZPs9SWY",
      altText: "Country Turkey & Veggie Stew"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "14.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_20_1",
        title: "Standard Can",
        availableForSale: true,
        price: { amount: "14.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_21",
    title: "Ocean Tuna Flakes",
    handle: "ocean-tuna-flakes",
    description: "Flakes of fresh-caught wild tuna packed in premium nutrient broth, ideal for cats or multi-pet diets.",
    vendor: "Don Perro",
    productType: "Wet Food",
    tags: ["wet-food", "cat", "wet"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA44SC1pTLHqxOppzpo41ZbeY8yK9f0CoWwakQXzmj-Dhgg1XkdfJnrSCXhl9GGTtBjccwoQ2z5uw6hV8bZbIG2INkm8VQfmluh0JucwBn5XaGFNVw6rarrJWvYj5WjQWrpI1PfqtFRzCKZp-0yURKUKBqMpqkjT7YCeg1zTwjxdL85Uvc7BBr3UY-C_Nie9S0pzvZE4AMMTF3XLic3U47Aju7E8f0pzxSP1yTaKrtYlNGBmfo5Z3FL2emwW9Vuep28_EEIa3ZyjbY",
      altText: "Ocean Tuna Flakes Can"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "16.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_21_1",
        title: "Standard Can",
        availableForSale: true,
        price: { amount: "16.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_22",
    title: "Raw Beef Freeze-Dried Bites",
    handle: "raw-beef-freeze-dried-bites",
    description: "100% pasture-raised raw beef, freeze-dried immediately to retain all natural enzymes, amino acids, and exquisite textures.",
    vendor: "Don Perro",
    productType: "Freeze Dried",
    tags: ["freeze-dried", "dog", "beef"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAm5QB1jVE4kMaNzKFCFaRvuGMoU9pF2BZXtXpQt2D7slejf1WsPhP_WrJwkkYhqomOtXG7FrfcTizqiZI5xefgNxdunjeRj_rJ9OywqrNXieV9LsNhbqbUSbSitYZhsBWWJMtjXO6Fl7vYi7u2qaPh8PVRPglGo38Fatlz2_3lZ--IA6KqB4jXpX5ISemJD5DMiU-0fSbnHsoPBIDqU49SWljQCoEx8Pnja9H3P91EN_zApHF7_CM5Vex61xh6MfkAl4c2errOTyU",
      altText: "Raw Beef Bites Tub"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "25.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_22_1",
        title: "8 oz Tub",
        availableForSale: true,
        price: { amount: "25.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_23",
    title: "Wild Salmon Crackle",
    handle: "wild-salmon-crackle",
    description: "Dehydrated Wild Alaskan Salmon pieces freeze-dried to render a satisfying crisp crunchy texture that pets adore.",
    vendor: "Don Perro",
    productType: "Freeze Dried",
    tags: ["freeze-dried", "cat", "salmon"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBuLr3E3R77u0Sz9bSFhOgJzDnRjGDEnI2bn6m1zp9mwzBN39o3_K9T8uc6vAxfx1Ud0-c-sGXlptvrsokfvWV_4OV0QaSmCT3XyRLcXsUhwfUPV3WA6v4yyvaIJ4Q1RSYC0akQNzAnnOFjz2VkMf67mNIfFnsDuh0pQdvsGQznkAkmTHdZOB2BxPJkyPGDvDWoyw1qiT__4eaMB8OibNi117CYPCCGamfdnQVTRWaMXcOsU7lcvh21wQQ9pmlIG0osGNOFB60ylhA",
      altText: "Wild Salmon Crackle Tub"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "28.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_23_1",
        title: "8 oz Tub",
        availableForSale: true,
        price: { amount: "28.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_24",
    title: "Everlast Leather Collar",
    handle: "everlast-leather-collar",
    description: "A premium, minimalist dark olive green leather dog collar with solid gold-plated brass hardware, resting on a clean canvas. Pebble-grain finish crafted to endure years of adventure.",
    vendor: "Don Perro",
    productType: "Accessories",
    tags: ["accessories", "collars", "new", "dog"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNY2prnMlpoHrwlyDUCOWguRhi6nprSPB9ZqFDLFUsZsqYt1H2062Y2V7JYDo8wZcugPJG0-gKoHZcIbwlRYouqP4MUMammcyxhj5cbdjY2Mo2MU9FQDAB_tH_KDFece7HtDeKLvclNSArEZxtCbKr_MTwoIOvo77cZBy5Hmfb5AfCGPaaM-1NqARy2o3hwzCsM_ojRwJvPtJwO8qiAcYF8GQ6CahOKwkC97MRANEq8FaOW6MUhPpnuPWrjHyOvLeKSiyDFjp9pZ0B",
      altText: "Everlast Leather Collar in Olive Green"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "28.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_24_1",
        title: "Large • Olive Green",
        availableForSale: true,
        price: { amount: "28.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_25",
    title: "Bamboo Chew Set",
    handle: "bamboo-chew-set",
    description: "A set of four sustainable bamboo dog chew toys with various organic shapes, designed to support dental wellness and long play hours safely.",
    vendor: "Don Perro",
    productType: "Toys",
    tags: ["toys", "sustainable", "dog", "chews"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDdnLmxXkOLagGsERY7MqXiiGTNkAe1CKxUJXybyOABMiLH50LxxexD5ViHwDzormUEQgroKiZdEPuFGln3OWaqpvACcEweaJ4FbNSKW1X1rfHq340Rse7D7GqQdFRWBx6P9qMrNdCywJWmeiz_zMOtj-eL8WoikyJN7_3OAmYb5jLCLhQDbVenIZQEJYACNhCv7rFPqMFJh18EsIgO25UCac1a708vK047Zx2Nj8b18fS0BapP-XmOCQyXf6PsCc0ZqRyOFUm6idRd",
      altText: "Bamboo Chew Set"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "18.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_25_1",
        title: "Standard Set",
        availableForSale: true,
        price: { amount: "18.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_26",
    title: "Salmon Bites",
    handle: "salmon-bites",
    description: "Premium organic dog treats in a modern matte-finish pouch. Formulated using pure natural ingredients with high protein levels.",
    vendor: "Don Perro",
    productType: "Treats",
    tags: ["treats", "organic", "salmon", "dog"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTpeRPqhN2ku7cZdykxRHKxjAJd13g8XpUqTCs5tGTMpPV0xKd6Nre0vldXJB_w9yPWp2NAxlOzQ0ME17zlr1vuvw98Vs3SBWPL86epeHhZn-U-wZapZOoiFHUjH9rZ1TZDCenL-FQabWDnkWiVKd2smJA7ThRtBY3MypMjz6PT_ZITxxWQut2k-Koi8nrgNgO9R6haObnaly9SsZ9vnwUg1FCVf2L5Eo8gnoIvgfYygOSz8_u8MLL5tv1fRAnHyFkPTiAjl-Kh2JL",
      altText: "Salmon Bites pouch"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "12.50", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_26_1",
        title: "Standard Pack",
        availableForSale: true,
        price: { amount: "12.50", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_27",
    title: "Explorer Leash",
    handle: "explorer-leash",
    description: "A durable, adjustable nylon dog leash in a deep forest green, coiled neatly to offer control, resilience, and style during walks.",
    vendor: "Don Perro",
    productType: "Gear",
    tags: ["gear", "leashes", "dog"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQrn6aJ0R5rfB3WeO-1sfrgq9TkK-YgYDYUpT5jwMSZnb6zyerJ3_2azGOzYmqNwgR3ua1aaD3NscQkhwlbOlyHPQD2k6tX0mhzLUuFAMZct3EvwtvfqWHdKUG_xcY_lEg-m42kqgFNV8SPEgmJL5d0pNh7dIerP23u5LPvpLwKrlIPOWEtWzBcQ8N9HuOYfeLtAJ868-o65GOAp_fEq3XLpK8RXpUGGbgpf1ujSdFNVaXXC7MnsXyY6y7Y9_IiKtAKDFZbTOHPkWy",
      altText: "Explorer Leash"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "22.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_27_1",
        title: "Standard Leash",
        availableForSale: true,
        price: { amount: "22.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_28",
    title: "Zen Ceramic Set",
    handle: "zen-ceramic-set",
    description: "A set of elegant ceramic dog bowls with a subtle, textured stone glaze on a sleek walnut wood tray.",
    vendor: "Don Perro",
    productType: "Dining",
    tags: ["dining", "bowls", "dog"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8bz8jOvswEJdjarEjXZFz_rSwqvn0NTdZ473_QVx_LMKX-jLm3KNeYjSEH1civDI-qA4irbN04f8q41FMgTczHnlPNtFSHlSSbXoxFqJXrGZuIinOiEvoDIl0oPiO8pUyeO8--y2YYPveAEBCDyohFSma1a-lQR6ZPwGceSaUseZ6VYoYAMqWO-8CANav9jUVLgDhTVWB6rr9vrZA7Rz2Wanb3y0ij9qN4pZJKYpahnCpLtktabxrPpcfwRmkCNbH5DSFHbh8wGm2",
      altText: "Zen Ceramic Bowls Set"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "34.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_28_1",
        title: "Standard Bowls with Tray",
        availableForSale: true,
        price: { amount: "34.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_29",
    title: "Royal Canine Feast",
    handle: "royal-canine-feast",
    description: "A high-quality studio photograph of premium organic grain-free dog food kibble in a minimalist white ceramic bowl. Organic & rich.",
    vendor: "Don Perro",
    productType: "Dog Food",
    tags: ["dog-food", "organic", "rich", "kibble"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDMm0Xwnqr6MSYCwthMQuoDzVW9UyvLwCkxKrE_Q5320V0Yee1ypc9w8rX6Q3WAaik7m4LA7SVSop_JPvqZalMdf72VI1cy9QhZnHW4JYFoeI2Cw2I90W7Nffd4XMq-wlywyJI-4ddekFGXE24ou_43s2CNM5MTrQtRlkqUE-Q2HWfYJrEH-KeglklhB2yDSD5W0JzyZCq_BzhRNs3mnVoIODyAXDieLKr6hF69TJVseAatg4-RyfzUWK3lb2RKjMZwNACsLOaYvfBi",
      altText: "Royal Canine Feast bowl"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "45.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_29_1",
        title: "2.5kg • Organic Grain-Free",
        availableForSale: true,
        price: { amount: "45.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_30",
    title: "Handcrafted Leather Collar",
    handle: "handcrafted-leather-collar",
    description: "A luxury leather dog collar in deep cognac brown featuring polished brass hardware. Tactile & handcrafted quality.",
    vendor: "Don Perro",
    productType: "Accessories",
    tags: ["accessories", "collars", "leather", "luxury"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoMJkZfdq4JjLvwAnFB2jxk9zxVjqDpvq9FZ8auQhw_7N2JSAluBYTd8bhxWYvX2W3HnR3OIUb994gr7pSLAqxt8MVgdIOH_4r34f3sT1pq8rU9YPoh6ekAgAJNnFbNFLgR0aAolA91uZP0aKbGlf0clhnOYwkzBMrRLxupg6IHL3PoQT_mNVeWrapsm1Vli9oD_VZXjITBvQjeVnwgqGnV6YREChnwrM-oqoNfiXDyWoYZLrfW1NqVrqaARG-XJQmsym_8-Ab66jW",
      altText: "Handcrafted Leather Collar in Tan Brown"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "85.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_30_1",
        title: "Tan Brown • Medium",
        availableForSale: true,
        price: { amount: "85.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_31",
    title: "Eco-Comfort Leather Harness",
    handle: "eco-comfort-leather-harness",
    description: "A premium organic dog harness in soft sage green. Handcrafted leather with ultimate flexibility and soft-padded felt interior for maximum comfort during active walks.",
    vendor: "Don Perro",
    productType: "Accessories",
    tags: ["accessories", "harnesses", "leather", "organic", "new"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCv7UYgLlqQA4k75rkYMgXvsQfbBgOY9iZrp06duR4lHS51AE9RVWyUHWnBmdLdyNtvM03KXfDm3pElnLhZRgD-c147fhQK1q02MrsEc8FwsF-Hygrof61AAju2nYZlveUlDxrN8Kqvefe58L05VD9J4LTV5I7vDilX3EoFBBUpdTlRByut_eSRYkDfePbF_ZQESdAIUCZErr2acq21GUvdZ2g7wYZlk7Suk6yDN51KcgRJDkGX64FVJtH7tfhyY2cvBMffb3MN_7Mz",
      altText: "Eco-Comfort Leather Harness in Sage Green"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "65.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_31_1",
        title: "Sage Green • Medium",
        availableForSale: true,
        price: { amount: "65.00", currencyCode: "USD" }
      }
    ]
  },
  {
    id: "prod_32",
    title: "Artisanal Pumpkin Bites",
    handle: "artisanal-pumpkin-bites",
    description: "A pile of luxury artisanal dog treats shaped like small bones, made from organic pumpkin and wild peanut butter. 100% grain free and baked daily.",
    vendor: "Don Perro",
    productType: "Dog Food",
    tags: ["dog-food", "treats", "organic", "pumpkin"],
    featuredImage: {
      url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfTVTRQFsLpUhOkzeZ326EpapMXS_IM6prr097CKnYM41I9RrhM-p7jPMtIq9aGXiRMc4EufL18ARyiPqr0zzum_F-F5cEB5iSqwEd3rbjkuvDoehFbA5ea-ff8RYU-PL48TYj3-r9iCWn5N7Wmm1njycDSCQrJM5c0KS4Dar6KLz5RBgBLOm-QtYNSr0zpitIQ8rVXiS3GOlwUv553CW4EUNep5IbG0GwqIFAM50nnclsN3jtkvP59X2709A91hGmTOHuNaB41vj8",
      altText: "Artisanal Pumpkin Bites treats"
    },
    images: [],
    priceRange: {
      minVariantPrice: { amount: "22.00", currencyCode: "USD" }
    },
    variants: [
      {
        id: "var_32_1",
        title: "Pack of 24 • Grain Free",
        availableForSale: true,
        price: { amount: "22.00", currencyCode: "USD" }
      }
    ]
  }
];

export const mockBrands: Brand[] = [
  {
    id: "b_1",
    name: "Royal Canin",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDysXnqFs1oBjE96nM_6h7mfLwR330vBz7x0JHbPk9dU51SbpTjYQo7Y3vipxbGFbbgQoHnCXD27fys47Au110iO8GBzZ8CblrcB3mcc_JyX6fTt4DOVhsmhGY4Tuf-sSjxHurw0RZ5gE_DOrT6vNPZQfoevY5lVd5zT0LMWR6wDexeJhELB3cfW7QSpqkaVooNUcLa1SiLuZHOEboIhtdI1rCzciD2DtYvRmARtdnBSVvjQKN0KiIm-2VoLnNVqh7Ws88ieZzEAu5n"
  },
  {
    id: "b_2",
    name: "Purina Pro Plan",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAkRY-OZmJc-_jG3idepgZY-13b4Hhkm4B4HxyXrSyDxbQI1XaatF9DoN4vvg3o-R81JFAM0WS9_DVIhkaj8nXjyMjS6bR7bwX9F2UYOurG6xgqCDpyzMo-hrvYOyFyaW-XcKyZgGVhyS73W60FN5HNE_zY9qdd2fqQIYin2szT7--_J-jqifDTDS-S-wVkYyxz0dHkX2OL92JPIxff9ttVh-pB4azX-IFHR3xfsEYftmgMIBU_p2aTFJlP-cT2pjsEwbn3l3DNrB2"
  },
  {
    id: "b_3",
    name: "Hill's Science Diet",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9mKafiQXyyw8jTXndokRpDkgjFNGi_SpcyxesLSsgfzUoX_GD2j7tAxQDfUchWRuZlzmGf-qRdBNHFQUr1rHWTBP1i2EoSKbev2HiZ0J25Vc-gbfue0Mfl4-S95ChEEwFLTk3xc_QA2TugrlFy3WyZgfPn8gzy5daeFcFhYLEpqfn491o_LLAayYyMt0i-Llom-CK1UWrndZ3NpBDWZbvKyyTocAXnL13TCPFU_tDchbuOFKG3q9slubewK7F6UJnXvsgc3uxLL2i"
  },
  {
    id: "b_4",
    name: "Acana",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6FmNGelrizFCx87IXK0W3N1outCS7zJZm79z7jCa8oxVZ-TfaidUgWb0rfXjOiiliJ-u6Xw1jcXelmW_0Q_RnEBm_ViuC3zB6rM_mSaFzQj-ZNykgfmhfluEm5Plbdk4a038VNIYHdOtx3NiraPq3akT9B2K19hVG_rTXPbfCka6K4hAh-Y1qQz9-JC3cRSeNc9C1D3BKeQe1X9ahdgwdDKEaR0kwP5fECPTobG32buXdKlQlSyyAa7yctaqvbNtuA35Hfvo_Q3v5"
  },
  {
    id: "b_5",
    name: "Orijen",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAhT9ETfzieMDd8YlW6ocKELaEp7XoUh9Tsmseaq4Ecq2tAGRIKUoL88xJKdqhvx2h-jre2MUX-tKreykHuK3xttZq-j0GZ-yHZzIqEzGh9wJc6erMAR_x2p-u-iXSTeWh_gREp25B923Q4MhNn45BlMJL9pfeZIIiGZ2EOSSgcxFgfc7NSaoBdHPF7ndwBonuWKfvacp2tADInGq-LuHG4uZQUWEyYn21tC3_2nErTlMm-om34fUYGqDkd_G8CufjYh3A_6aw8KiQt"
  },
  {
    id: "b_6",
    name: "Taste of the Wild",
    logoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHUAO_wNl3RMIqcLBWCBoxGNPza3gouPzA7lZ_xA8-Dl0J71yflQDeB_z9DPdQ6rtUT6Lb_M9LKV28iJkXHd1hpZeHC7PrkZn0wp5lz0xRePIM6IWkLhdOZBqfPqaBPRdhjmjx-1eYv8pmSlua61wRli9wWKwHcV6TFFrLiWHDa68PzO7q0q_UrRFZabRaTr8eE4W6AON5BFMyQs2y1XnC1U_TQ12mo1BW_HAepIAmV2cYooE6_2NSe9shilpXch-sMVLBCqx70ZGY"
  }
];

export const mockTestimonials: Testimonial[] = [
  {
    id: "test_1",
    name: "Sarah Jenkins",
    role: "Goldie's Mom",
    quote: "The quality of the organic food is unmatched. My dog's coat has never been shinier!",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqRO3tRuNAJiSr2U83i5KylLPX_82pZ89NXNVv5IXU0jT5LG5A6t1MR8dAe8ypqUOl-7g1k5936joj-EGJ8paT1gVpD4oKUZBpopD5Xnj53uQfTkti_l8vWKUaji_nYWDFKphYgH7rnLFkFR8SxJvNRjSEKG4Fr1bRG18Yll0vwDz_HmLTuDnWMzdIJ2unsPOSPmkJkJKLnZJFpPstvMGE3bdCZWHs2ycTmyfc_uswcmLJpGodkErS1C2E80EKNrvg7-HMWlUUAjM",
    rating: 5
  },
  {
    id: "test_2",
    name: "Mark Thompson",
    role: "Oliver's Human",
    quote: "Finally, pet accessories that actually look good in my apartment. Design meets function.",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDM0Bn9XpsNvK6ng5Pwls0nzIttqvKz9dbIGXF6jkXxvFtIjnVGAOxZ09O-DNlmnNgap8Q2LTSyAXKEvCyxnsZ_KkSzuHIfLNEu14cyXjEuhC68CWUHfqPQZfhwl17QYvKrzWm1HNDA0qvpQpO5LnaVgN3NByb7yIqLr6-pOcjqpa-43z1MSUEEf4HuvL3r2_6-FJSdvWpCD2jcxJuYQe0OqFi-tZOQq8Kc5LniZuU8xB-aWcjnSjNKXtDn0qd05E_Mq3_FBBJm-lY",
    rating: 5
  },
  {
    id: "test_3",
    name: "Elena Rodriguez",
    role: "Bella's Family",
    quote: "The customer service is impeccable. They truly care about the pets they serve and treat them like Royalty.",
    avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCELPT4oMEzQnKLSL9eTq_ePAAk73dWZMhSJ87VRCHA2eHz3w8iqpw7hM2CZ-xCgHs6t2ZYjTZ_gOlwQYkZ4Lmw_DgoA1yMJOkgdtu0r7crx7imbuhGmSCZsfRvRkPJzECHBI4_6L399OjginE7-RrA3KTD9yNGgF58Fv4z676uYrGKD2ziPB5hPhrlbdTDackqHj_tePJSBQp77mMjAg5kNrj-EAbz-79B2EpcoeTV9H95oxDPqqKqspMO33KdS5aR2d6x8YRCV8I",
    rating: 5
  }
];
