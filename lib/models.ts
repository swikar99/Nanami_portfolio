// MongoDB document shape for the locales collection
export interface LocaleDoc {
  locale: string;
  updatedAt: Date;
  data: {
    nav: {
      home: string;
      about: string;
      work: string;
      media: string;
      contact: string;
    };
    hero: {
      greeting: string;
      name: string;
      title: string;
      subtitle: string;
      cta: string;
    };
    about: {
      title: string;
      description: string;
      highlight1: string;
      highlight2: string;
      highlight3: string;
    };
    work: {
      title: string;
      [key: string]: string | { title: string; description: string };
    };
    media: {
      title: string;
      subtitle: string;
      featured: string;
      speeches: string;
      videos: string;
      [key: string]: string;
    };
    contact: {
      title: string;
      description: string;
      social: string;
      cta: string;
    };
    footer: {
      rights: string;
      mission: string;
    };
  };
}
