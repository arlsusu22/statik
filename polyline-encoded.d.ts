declare module 'polyline-encoded' {
  interface PolylineOptions {
    precision?: number;
    factor?: number;
    dimension?: number;
  }

  interface PolylineUtil {
    decode(encoded: string, options?: PolylineOptions): [number, number][];
    encode(coordinates: [number, number][], options?: PolylineOptions): string;
  }

  const polylineUtil: PolylineUtil;
  export default polylineUtil;
}
