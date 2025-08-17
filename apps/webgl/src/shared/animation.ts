import * as TWEEN from "@tweenjs/tween.js";
import type { CustomObject3D } from "@/components/cars/types";

interface DoorProps {
  onStart?: () => void;
  onComplete?: () => void;
}

export const doorAniamation = (
  axis: string,
  startAngle: number,
  endAngle: number,
  door: CustomObject3D,
  props?: DoorProps
) => {
  const status = {
    angle: startAngle,
  };
  const tween = new TWEEN.Tween(status);
  tween.to(
    {
      angle: endAngle,
    },
    1000
  );
  tween.onUpdate(() => {
    if (axis === "y") {
      door.rotation.y = status.angle;
    } else {
      door.rotation.z = status.angle;
    }
  });
  tween.onStart(() => {
    props?.onStart && props.onStart();
  });
  tween.onComplete(() => {
    props?.onComplete && props.onComplete();
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return tween;
};
