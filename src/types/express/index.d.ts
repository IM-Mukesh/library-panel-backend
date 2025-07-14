// types/express/index.d.ts

import { User } from "../../models/User"; // adjust path to your User model
import { Request } from "express";
import "express";
declare global {
  namespace Express {
    interface Request {
      libraryId?: string;
    }
  }
}

declare module "express" {
  export interface Request {
    libraryId?: string;
  }
}

import { ILibraryJwtPayload, IFounderJwtPayload } from "..";

declare namespace Express {
  export interface Request {
    libraryId?: string;
    user?: ILibraryJwtPayload | IFounderJwtPayload;
  }
}

import { LibraryDocument } from "../../models/Library"; // or replace with actual decoded type

declare global {
  namespace Express {
    interface Request {
      library?: {
        libraryId: string;
        [key: string]: any; // optional if more fields exist
      };
    }
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: User; // or whatever your decoded user type is
    }
  }
}

// types/express/index.d.ts

// Extend multer-s3 file type
declare module "multer-s3" {
  namespace MulterS3 {
    interface File extends Express.Multer.File {
      location: string;
      key: string;
      bucket: string;
      acl: string;
      contentType: string;
    }
  }
}
