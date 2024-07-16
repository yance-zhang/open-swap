declare module "*.svg";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.bmp";
declare module "*.tiff";

interface ImportMetaEnv {
  readonly VITE_CHAIN_ID: string;
  readonly VITE_API_URL: string;
  readonly VITE_SWAP_ROUTER: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
