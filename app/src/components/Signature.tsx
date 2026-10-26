import { useMemo, useRef, useState } from "react";
import { PanResponder, View, type LayoutChangeEvent } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors, radius } from "./theme";
import { Button, Row, T } from "./ui";

/** Signatures are kept as SVG path data in a 300 × 120 box, whatever the size of the pad they were drawn on. */
const BOX = { w: 300, h: 120 };

/** A box to sign in with a finger or the mouse. Calls onChange with the drawing (or null when it's cleared or too short). */
export function SignaturePad({ onChange }: { onChange: (svg: string | null) => void }) {
  const [paths, setPaths] = useState<string[]>([]);
  const [live, setLive] = useState("");
  const size = useRef({ w: 1, h: 1 });
  const stroke = useRef({ d: "", points: 0 });
  const total = useRef(0);
  const done = useRef<string[]>([]);

  const at = (x: number, y: number) =>
    `${((Math.min(Math.max(x, 0), size.current.w) / size.current.w) * BOX.w).toFixed(1)} ${((Math.min(Math.max(y, 0), size.current.h) / size.current.h) * BOX.h).toFixed(1)}`;

  const responder = useMemo(() => {
    const finish = () => {
      if (stroke.current.points > 1) {
        done.current = [...done.current, stroke.current.d];
        total.current += stroke.current.points;
        setPaths(done.current);
        onChange(total.current >= 8 ? done.current.join(" ") : null);
      }
      stroke.current = { d: "", points: 0 };
      setLive("");
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false, // don't let the page scroll take over mid-signature
      onPanResponderGrant: (e) => {
        stroke.current = { d: `M${at(e.nativeEvent.locationX, e.nativeEvent.locationY)}`, points: 1 };
        setLive(stroke.current.d);
      },
      onPanResponderMove: (e) => {
        stroke.current = { d: `${stroke.current.d} L${at(e.nativeEvent.locationX, e.nativeEvent.locationY)}`, points: stroke.current.points + 1 };
        setLive(stroke.current.d);
      },
      onPanResponderRelease: finish,
      onPanResponderTerminate: finish,
    });
  }, [onChange]); // eslint-disable-line react-hooks/exhaustive-deps

  const clear = () => {
    done.current = [];
    total.current = 0;
    setPaths([]);
    onChange(null);
  };

  return (
    <View>
      <View
        {...responder.panHandlers}
        onLayout={(e: LayoutChangeEvent) => (size.current = { w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
        accessibilityLabel="Signature box: draw your signature here"
        style={{ height: 150, borderRadius: radius.md, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.faint, backgroundColor: colors.card, overflow: "hidden", touchAction: "none", cursor: "crosshair" } as never}
      >
        {/* The drawing never takes the touches, so positions are always measured against the box. */}
        <View pointerEvents="none" style={{ flex: 1 }}>
          <SignatureDrawing svg={[...paths, live].filter(Boolean).join(" ")} />
          {!paths.length && !live && (
            <View style={{ position: "absolute", left: 16, right: 16, bottom: 34, borderTopWidth: 1, borderColor: colors.border }}>
              <T variant="small" muted style={{ marginTop: 6 }}>Sign here</T>
            </View>
          )}
        </View>
      </View>
      <Row style={{ justifyContent: "flex-end", marginTop: 6 }}>
        <Button title="Clear" icon="refresh" variant="ghost" size="sm" onPress={clear} disabled={!paths.length} />
      </Row>
    </View>
  );
}

/** A saved signature, drawn to fill its box. */
export function SignatureDrawing({ svg, height }: { svg: string; height?: number }) {
  return (
    <Svg width="100%" height={height ?? "100%"} viewBox={`0 0 ${BOX.w} ${BOX.h}`} preserveAspectRatio="xMidYMid meet">
      {!!svg && <Path d={svg} stroke={colors.text} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    </Svg>
  );
}
