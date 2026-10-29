/* Controlled accent palette (blue, green, violet, amber/orange, rose for alerts) shared by CSS-in-JS spots,
   charts and the 3D scene. CSS has the same values as --hue-* tokens. */
import type { Hue } from '../domains/types';

export interface HueSpec {
  base: string; // marks, lines
  from: string; // gradient start (icon tiles)
  to: string; // gradient end
  soft: string; // tinted background (light theme)
  ink: string; // readable text on the soft background
}

export const HUES: Record<Hue, HueSpec> = {
  green: { base: '#12B76A', from: '#3FDB95', to: '#0E9F6E', soft: '#E8F8F0', ink: '#067647' },
  blue: { base: '#2F6BFF', from: '#5B8CFF', to: '#2155F0', soft: '#EAF1FF', ink: '#1F4ED8' },
  violet: { base: '#8B5CF6', from: '#B98BFF', to: '#7C3AED', soft: '#F2ECFF', ink: '#6D28D9' },
  orange: { base: '#F79009', from: '#FFC145', to: '#F97316', soft: '#FFF4E5', ink: '#B54708' },
  rose: { base: '#F43F5E', from: '#FF7D93', to: '#E11D48', soft: '#FFECEF', ink: '#C01048' },
  teal: { base: '#14B8A6', from: '#4FE0CB', to: '#0D9488', soft: '#E6F8F5', ink: '#0F766E' },
  amber: { base: '#F5B70B', from: '#FFD75E', to: '#F59E0B', soft: '#FFF8E1', ink: '#B45309' },
  sky: { base: '#0EA5E9', from: '#4CC7FA', to: '#0284C7', soft: '#E6F6FE', ink: '#0369A1' },
  slate: { base: '#94A3B8', from: '#B8C2D1', to: '#7A8799', soft: '#F1F4F8', ink: '#475467' },
};

/** Order used when a list needs distinct colours (donut segments, bars). */
export const HUE_ORDER: Hue[] = ['blue', 'sky', 'orange', 'violet', 'rose', 'teal', 'green', 'amber', 'slate'];

export const hue = (h: Hue) => HUES[h];
