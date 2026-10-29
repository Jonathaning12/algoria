import type { SpriteId } from '@algoria/shared';
import { spritePaths } from '../game/sprites';

interface Props {
  id: SpriteId;
  size?: number;
  flip?: boolean;
  className?: string;
  /** Si se pasa, el sprite se anuncia como imagen; si no, es decorativo. */
  label?: string;
}

export function Sprite({ id, size = 64, flip = false, className, label }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={className}
      style={{ display: 'block' }}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true })}
    >
      <g transform={flip ? 'translate(16 0) scale(-1 1)' : undefined}>
        {spritePaths(id).map((p) => (
          <path key={p.fill} fill={p.fill} d={p.d} />
        ))}
      </g>
    </svg>
  );
}
