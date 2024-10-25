export const jobImages = {
    "Software Developer": [
      "/jobs/developer-1.jpg",
      "/jobs/developer-2.jpg"
    ],
    "Data Scientist": [
      "/jobs/data-scientist-1.jpg",
      "/jobs/data-scientist-2.jpg"
    ],
    "UX/UI Designer": [
      "/jobs/designer-1.jpg",
      "/jobs/designer-2.jpg"
    ],
    "Product Manager": [
      "/jobs/product-manager-1.jpg",
      "/jobs/product-manager-2.jpg"
    ],
    "Digital Marketing Specialist": [
      "/jobs/marketing-1.jpg",
      "/jobs/marketing-2.jpg"
    ]
  } as const;
  
  export type JobPosition = keyof typeof jobImages;
  
  export const getRandomJobImage = (position: JobPosition): string => {
    const images = jobImages[position];
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };