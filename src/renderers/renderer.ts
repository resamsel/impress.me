import {RendererOptions} from './renderer-options';

export interface Renderer {
  render(code: string, lang: string, options: RendererOptions): Promise<string>;
}

export const rendererMap: Record<string, Renderer> = {};
