import type React from 'react';

export interface StyleOption {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  theme?: string;
}