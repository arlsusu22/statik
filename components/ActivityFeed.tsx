
import React, { useState, useMemo } from 'react';
import { ActivityStats, StravaAthlete } from '../types';
import { StravaIcon, RefreshIcon, ViewOnStravaLink } from '../constants';
import { getStatsForActivityType } from '../utils/activityStats';

interface ActivityFeedProps {
  activities: ActivityStats[];
  onSelectActivity: (activity: ActivityStats) => void;
  onManualUpload: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
  athlete?: StravaAthlete | null;
}

// Activity type colors - vibrant but not harsh
const ACTIVITY_COLORS: Record<string, string> = {
  run: '#CCFF00',      // Neon yellow-green (signature color)
  bike: '#00D4FF',     // Cyan blue
  ride: '#00D4FF',     // Alias for bike
  hike: '#FF9F43',     // Warm orange
  walk: '#FF9F43',     // Same as hike
  swim: '#54A0FF',     // Pool blue
  workout: '#FF6B6B',  // Coral red
  default: '#A0A0A0',  // Neutral gray
};

// Simple polyline decoder (Google's encoded polyline algorithm)
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0, lat = 0, lng = 0;

  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);

    points.push([lat / 1e5, lng / 1e5]);
  }
  return points;
}

// Mini route preview component
const RoutePreview: React.FC<{ encodedPolyline?: string; color?: string }> = ({ encodedPolyline, color = '#CCFF00' }) => {
  const pathData = useMemo(() => {
    if (!encodedPolyline) return null;
    
    try {
      const decoded = decodePolyline(encodedPolyline);
      if (decoded.length < 2) return null;
      
      // Get bounds
      const lats = decoded.map(p => p[0]);
      const lngs = decoded.map(p => p[1]);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      // Add padding
      const padding = 0.15;
      const latRange = maxLat - minLat || 0.001;
      const lngRange = maxLng - minLng || 0.001;
      
      // Normalize to SVG coordinates (0-100)
      const points = decoded.map(([lat, lng]) => {
        const x = padding * 100 + ((lng - minLng) / lngRange) * (100 - 2 * padding * 100);
        const y = padding * 100 + ((maxLat - lat) / latRange) * (100 - 2 * padding * 100);
        return `${x},${y}`;
      });
      
      return `M ${points.join(' L ')}`;
    } catch {
      return null;
    }
  }, [encodedPolyline]);
  
  if (!pathData) {
    // Fallback animated placeholder
    return (
      <div className="w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-16 h-16 opacity-20">
          <path
            d="M20 80 Q30 30, 50 50 T80 20"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            className="animate-pulse"
          />
        </svg>
      </div>
    );
  }
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Glow effect */}
      <defs>
        <filter id="routeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* Route path */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#routeGlow)"
        opacity="0.9"
      />
      {/* Start dot */}
      <circle
        cx={pathData.split(' ')[1].split(',')[0]}
        cy={pathData.split(' ')[1].split(',')[1]}
        r="3"
        fill={color}
      />
    </svg>
  );
};

// Fallback Mock Data if no activities are fetched (for dev/demo)

// Colorado Mountain Trail Run - loop trail pattern
const TRAIL_RUN_POLYLINE = '_`}kFvnqgScP}EiPeDgPiBePo@{OBoOv@_OdBkNlCsMlDyLjE{K~E{JrF{I`GwHlGuGvGsF`HoElHmDxHmCjIqB`JsAxJ{@tKc@tLSxMA|NF`PPfQThRTfST~SLnTFxTEvTQnTa@zSq@~ReAxQyAlPmBzN_CbMuCfKiDnI{DvGmE~E{EpDmFhCyFdBcGpAoG`AuG|@}G`A_HnAcHdBcH~BcH|CcH`E_HdF}GfGwGfHsGbIoGzIiGlJcGxJ_G`KyF~JsF|JmFrJkFfJcFzI_FlIyE`IsExHoErHgEpH_EtHwD~HmDlIcD`JyCzJiCrK{BpLiBnMwAjNeAbOm@xOWfP?rPXrPr@lPpA~OjBjOfCnNdDlM`EhLzE~JvFvInGnHdHhG|HfFnIjE~IvDnJjDxJdD`KjDfKrDjKfEhK`FfK|F~J|GxJ|HlJ~IbJ|JrItKdIjLrHtLdHzLrGvLbGjLtFtKdFvJxEtIlElHdE~F|DnExD~CvDpBxDdAzD\\bEEhEa@vEy@`FiApFuA`GyArG{AdHyAvHsAhImAzIiAlJeAzJgAjKiAvKqA`L_BhLoBlLeCpL}CnLyDlLsEdLmF|KeGpK{GdKkHvJqHbJsHrIkH`IyGnHaGzG}EjGsDzFeCjFmA~EUvEb@lE|AjEtChEdElEnFpEtG|ElHhF|HzFdIlG|HbHnH|HvGvIvFpJnEnKdDjLtBfMdAbNTzNUrOcAfPgBvPiCbQeDjQ{DnQmElQ{EdQcFxPkFdPoFlOwFpN_GlMgGdLuGzJgHhI_IxGyI`FwJjD}KrBaMx@iN@qOu@yPiB{Q{C{RmEsSuFeT_HqT}HqT{IgTqJyScK}RkK_RoKuPmKkOeK}MyJkLeJ}JmIqIsHiHsGgGsFmFmE{EiDqEcCqE}AyEy@gFU_GJyGf@wHbA{IxAyJjByKzBuL`CmMfC_NfCiN~BkNvBiNdB}MtAmM|@wLb@}KF_KUcJw@cIwAiHwBsGwC}FyDoFuEiFqFeFiGiFaHqFsH_GcIoGmIaHsIuHyIgIwIyIsIcJmIkJaImJuHkJcH_JsGoIaG{HmF_HyEcGeEcFsDcEcDgDsCiCgCsB}BcBuByAsBwAsB{AwBkB}BcCiC}CyCaEiDiF_EqGuE}HqFeJkGkKiHkLgIgMeJwMaK_N_L_NyLsMsM_MkN_L}NwJmOkI';

// City Run 9.2km - grid pattern with right-angle turns through city blocks
const CITY_RUN_POLYLINE = 'crzwFjblbMkFA?oEoFA?qEqFA?sEsFA?oEnFA?qFpFA?rFrFA?tFtFA?oEoFA?qEqFA?sEsFA?uEnFA?pFpFA?rFrFA?tF';

// Long Bike Ride 41.8km - real route from Kosovo (Pristina to Ferizaj area)
const BIKE_RIDE_POLYLINE = 'mydcG}p{_C@EIyBUcAM[C}@Ds@ImASoA_@iDi@Am@MW[y@yDWqAF}ALe@n@]pCaB}CqJg@mB`@YBG@KCM}BsFmB{Em@eBp@QVUxAk@NKT[`@QZ[PYT[n@k@TUt@oAr@o@dC}BnBoBh@g@|@}@JK^[j@o@p@eAl@uANYZe@l@o@d@g@xAiA~B{At@c@LCLINKIUAQ@a@DQl@cAvBoCtAeBrEeEXS\\OzAa@rA]d@IdE]dHuAPMFUL_BHOhA_AEuBEmBH[V`@DUJODCPAFBLJVBj@T`An@x@f@pAv@zAVRDrBZdFVfABbABxAFdAJxCP^@xAHrAHdA@xAFdAHT?bDHdDF|@B`ABF?P@n@@J@hDHvKNpC@dCJnCDlABjB@fA?lAD{@uGGuA@q@d@}ARe@j@WJEtDuAx@QF@tAa@F?pCaGx@gAVQ|@_@POJSXcA\\qAX_@ZG\\Fb@DjAg@d@s@Gq@Cy@vAy@h@SjR_HbIeFtDwBpD{BdJyGd@Uh@El@BxGvBt@N|@Ch@YVu@NkBDoCJyA^qAn@qAbAu@vAk@dBa@bMgC|Bq@`C_AhEkBzAiAvFqF|AeAtAmAzHiJfAo@jAUtIeAbA@~@Er@i@dAg@d@Qf@A`AD~@@f@?t@OrCi@t@]BTFXfBtE^|@HPn@p@`Ab@|@^x@j@XTr@v@p@`Ar@zAv@rBd@~@h@r@bAdApAdA`CzAhGpDbBjAjCvBfC`BdAv@pErDrElD~DzBrCpAb@PdC`AfCr@fAXvEzBhAv@dCxAlBvA|DrDnFoExGaFbD}BpFoDt@c@`Ak@zD{BdJaF`CqAfGkCbCgAlFqBvFmBfF_BbBe@x@WjDy@RGjAYv@Op@QjBc@hKkB~LqBp@M|@Kb@BNALLN@LKBE\\SVQn@I\\GfC[dJwAnGiAnB]tG{A`KsC|EoBn@Ur@SzAm@|DaBrAi@pFkCrBgApAq@tDyB|HeExH}D`@ShCwAlIsElPsIjB_AnH_DxCqApB{@d@M`EqAdCw@tDkA~Ag@TG\\Kf@OjDo@h@Kr@OhBa@jAWr@MvCi@rDk@lC_@JCp@Ip@Kh@G^EZC`@Ed@Ed@E^EPCp@GTCfAG\\CzAI`BKhDSnAEn@AnACvCEd@AxAAJ?xBA|EBtDDX?dBFxAFfADd@BZ@jAFzEV^B|ANn@FpCZtDd@ZDlANdInAJBt@Jt@P|@PbEz@|@Rl@PJBn@NtI`C`FdBvG`CfJfDr@TFBp@V`DlApBv@t@ZjFnBNFte@jQzBz@zJvDfA`@lAd@zLrEl@THBTHPH|@^|O|FpAd@bC|@`Cz@vDtA`A^hN|EdCp@|Bl@dAZpA^v@Rd@JzD`AjGvA|Dx@n@LtB`@`Dp@vMxB|IdApD\\nD^dHr@pCVr@BfDNxAFtH\\~FJ`DBfEBhH?vBAtFIfAChACRAvAG`H[bKe@lLy@zCY|Eq@tBYzBWnDo@~C]nEw@fEu@~Ck@ZGFA~D{@JCNGvCy@jJaC`AYj@M`Cs@n@S|@WXKjGuBlC_AnDoAnDwAdKkEvJuEhAi@z@m@ZMTMdB_ALCvBcAr@c@`B{@VMbAi@ZGNFLIDMTe@jF}C`BcA~DoCnI_GhDcC`IkG|BwBrAw@|LiKLK|BiBPOjDyCb@[|@]HAFEDI@MCKbBuAdA}@|BkBfB{AfLaJdAw@dDcCtB}AbBiAv@k@`BqAfAm@bCaBtAy@dAk@bB}@\\ShJaFrDcBzAo@lAi@`Bo@hBq@nAc@fFcBh@QnAa@f@OFCb@KzGgBtKeC`FiAjEgApA[jJqCjDmAlAg@~EkBzKyE|IwEhEcCzP{Kh@]jAq@lEeCxHuDfF}Bn@SrBs@fLaDlA[zBu@tHwAlBS`DYfGo@nAMxAMbBEd@CxAKbAExEa@lCMhSgApG_@`OeBn@KbOcCrGsAdCm@n@Qp@Q|Cs@xMsDvBs@|Bo@GYy@Xm@D_GsCgCw@iB_@kCSuBGoC@cBm@KF';

// Central Park 10K - real NYC Central Park route  
const FAST_5K_POLYLINE = 'wfywFxsobM]RUXMVi@Ae@USIUBMD}@l@GDUz@Ol@KXm@d@yA?MYKC[DOFEFg@MGIO]I_@SVo@Tk@?o@Y_@W[_@Wg@[Au@]ME[a@i@k@ADo@c@{@e@gBg@CLAFg@Qw@[k@Us@a@GRqA}@u@k@KK]@QDy@h@YDs@EQIe@]WEG@MKIMAAQ_@y@_@k@i@GQEKOISE]ASIMOg@}@WW{@m@g@q@y@yA{@EMBq@^I?MEIE]i@K_@SJU@s@[i@e@Qa@Oi@CQAK@JQHWFWAYGK?QJEPaEmCCAOKQKAAECPo@Ja@Cu@?eAOcAQq@GSUa@[S_@K[?[@B_@LDMEC^i@_@o@Me@VYLk@HWG_@C_@HSRW`@AAEEGECCkBiACCCCOKGCCCOKyAaAUOgBkAUOgBiAUOgBkACAKI?WK_@IS@c@AAEEKEAACAGECAEGCCACU_@W_@[]i@[U[GYSyACQI]Qc@SYSO_@?WBg@Fe@A]Ms@_@_A@[I[Qi@k@EEAIAGAMUw@AM@SLc@?g@EOYe@CEACWOYKDODYy@Y}@a@o@]YSw@y@eAaASYEGMUSRGDQe@Uw@m@aDE@u@IWDUWIEK?C@IFKFc@GSUU_@GQS_@MOUSWKSGMGEQ?s@CQGOMGQEIDGFQXGDM@[GCLJn@Ko@BMAIBW?SGUYg@IYYk@o@k@KQEOAMAIESi@s@Mg@Kc@i@o@Kk@Bg@Q?ACGEIAH@FD@BP??EJWRQPMBI?KIYUm@]k@HAPDD?BEBc@@GDM?A?A@CBEBE`@T^Lb@BTGVOXSFQFEHAJ@@IBIBEFEBUHYFGGQIaADIHERq@BO?WHo@@CNINAPHNPDH@BFNl@h@Hb@AP^N\\XXXl@`ABRDNJTNTz@z@DP@LC\\O`AFAh@\\t@[VCh@Pf@Xl@Hf@A|AWXARHjArANOFIDGNQLCb@E@?NKb@DANN`@NNj@ZXVNXTjAFNj@d@`@v@LLHHJHRLPFFB`@?NEpAqAj@_@XI`@Cp@Hj@Vz@NZ?bAKZDf@PpAn@dLrHRLJHpL|Ht@l@Zp@NdA@dAQtBG`AB\\Hj@VtAHZFHPCHHLFd@Fd@ZV\\l@hA?@Vb@RPd@VVHjAFLDXRFFZr@\\RZ?`@GVMh@w@n@g@JMbA`BPNNFf@FXFlAv@HB`@A@?`@?ZRDBZXr@fATPn@Z\\L|AlBr@bAZVv@ZXBRDPP^BVOb@g@VMPEB?T?B@P@TJPFNHU`AEp@Fb@FLf@d@l@d@G\\~@b@p@h@\\f@Zt@JMDNNRTLXDZAd@Gx@a@h@`@lAZXLLJV`@JPNPr@v@j@Fp@CXHd@^Z?HDPLtA`A\\RvCjBGj@PNJZh@Uh@Ch@NlAt@ENAFGLMIMOg@[QGPFf@ZLNLHrAx@TNt@d@JJcA`DUp@oBjGIR[?KDWZAB';

const MOCK_ACTIVITIES: ActivityStats[] = [
  {
    id: '1',
    title: 'Afternoon Run',
    distance: '32.5 km',
    time: '3h 45m 22s',
    elevation: '1,285 m',
    pace: '6:56 /km',
    type: 'run',
    date: 'Today, 6:00 AM',
    calories: '2,450 kcal',
    heartRate: '152 bpm',
    polyline: CITY_RUN_POLYLINE,
  },
  {
    id: '2',
    title: 'Trail Run',
    distance: '9.2 km',
    time: '45m 18s',
    elevation: '42 m',
    pace: '4:55 /km',
    type: 'run',
    date: 'Yesterday, 6:30 AM',
    calories: '580 kcal',
    heartRate: '162 bpm',
    polyline: TRAIL_RUN_POLYLINE,
  },
  {
    id: '3',
    title: 'Morning Ride',
    distance: '41.8 km',
    time: '1h 32m 45s',
    elevation: '385 m',
    pace: '27.1 km/h',
    type: 'ride',
    date: 'Sunday, 8:00 AM',
    calories: '1,120 kcal',
    heartRate: '145 bpm',
    polyline: BIKE_RIDE_POLYLINE,
  },
  {
    id: '4',
    title: 'Evening Run',
    distance: '10.2 km',
    time: '48m 36s',
    elevation: '72 m',
    pace: '4:46 /km',
    type: 'run',
    date: 'Saturday, 9:00 AM',
    calories: '685 kcal',
    heartRate: '168 bpm',
    polyline: FAST_5K_POLYLINE,
  },
];

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities, onSelectActivity, onManualUpload, onProfile, onSettings, athlete }) => {
  const [isSyncing, setIsSyncing] = useState(false);

  // If real activities exist, use them. Otherwise use mock for display until sync.
  const displayActivities = activities.length > 0 ? activities : MOCK_ACTIVITIES;

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
        setIsSyncing(false);
    }, 1500);
  };

  // Activity type icons
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'run':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
          </svg>
        );
      case 'bike':
      case 'ride':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M15.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zm5.8-10l2.4-2.4.8.8c1.3 1.3 3 2.1 5 2.1V9c-1.5 0-2.7-.6-3.6-1.5l-1.9-1.9c-.5-.4-1-.6-1.6-.6s-1.1.2-1.4.6L7.8 8.4c-.4.4-.6.9-.6 1.4 0 .6.2 1.1.6 1.4L11 14v5h2v-6.2l-2.2-2.3zM19 12c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5z"/>
          </svg>
        );
      case 'hike':
      case 'walk':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/>
          </svg>
        );
      case 'swim':
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
            <path d="M22 21c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.08.64-2.19.64-1.11 0-1.73-.37-2.18-.64-.37-.23-.6-.36-1.15-.36s-.78.13-1.15.36c-.46.27-1.08.64-2.19.64v-2c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36v2zm0-4.5c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36s-.78.13-1.15.36c-.47.27-1.09.64-2.2.64v-2c.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36v2zM8.67 12c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.12-.07.26-.15.41-.23L10.48 5C10.19 4.41 9.59 4 8.9 4H6v2h2.9l2.83 5.66c-.92.42-1.48.83-1.83 1.03-.46.27-1.08.64-2.19.64v2c1.11 0 1.73-.37 2.18-.64.37-.22.6-.36 1.15-.36z"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M2 12h4l2-6 3 12 2-6h4l2 3h3"/>
          </svg>
        );
    }
  };

  return (
    <div className="h-screen w-full flex flex-col font-sans text-white overflow-hidden relative">
      {/* Dark checkerboard background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #1a1a1a 25%, transparent 25%), 
            linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #1a1a1a 75%), 
            linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          backgroundColor: '#111',
        }}
      />

      {/* Main Content Wrapper */}
      <div className="flex flex-col h-full w-full max-w-2xl mx-auto relative z-10">
          {/* Header */}
          <div className="px-5 pt-14 pb-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Recent Activities</h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <div className={`w-1.5 h-1.5 rounded-full bg-[#CCFF00] ${isSyncing ? 'animate-ping' : ''}`}></div>
                 <span className="text-[10px] font-medium text-zinc-500">{activities.length > 0 ? `${activities.length} synced` : 'Demo mode'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={`w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center ${isSyncing ? 'text-[#CCFF00] border-[#CCFF00]/50' : ''}`}
                >
                    <div className={`${isSyncing ? 'animate-spin' : ''}`}>
                        <RefreshIcon />
                    </div>
                </button>
{onSettings && (
                  <button 
                      onClick={onSettings}
                      className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center"
                  >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                  </button>
                )}
                {onProfile && (
                  <button 
                      onClick={onProfile}
                      className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-all flex items-center justify-center overflow-hidden"
                  >
                      {athlete?.profile_medium ? (
                        <img 
                          src={athlete.profile_medium} 
                          alt={`${athlete.firstname || 'Profile'}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      )}
                  </button>
                )}
            </div>
          </div>

          {/* Feed List - Compact Cards */}
          <div className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar">
            <div className="space-y-1">
                {displayActivities.map((activity, index) => {
                  const activityColor = ACTIVITY_COLORS[activity.type || 'run'] || ACTIVITY_COLORS.default;
                  const stats = getStatsForActivityType(activity).slice(0, 3);
                  
                  // Check if we should show date header (first item or different date from previous)
                  const showDateHeader = index === 0 || 
                    displayActivities[index - 1]?.date !== activity.date;
                  
                  return (
                    <div key={activity.id}>
                      {/* Date header */}
                      {showDateHeader && (
                        <div className="pt-4 pb-2 first:pt-0">
                          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">
                            {activity.date}
                          </span>
                        </div>
                      )}
                      
                      {/* Activity card */}
                      <div 
                        onClick={() => onSelectActivity(activity)}
                        className="group flex items-stretch bg-black/40 backdrop-blur-sm border border-zinc-700/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-zinc-500 active:scale-[0.98]"
                        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset' }}
                    >
                      {/* Left: Route or Icon - 72px for good touch target */}
                      <div 
                        className="w-[72px] flex-shrink-0 flex items-center justify-center bg-zinc-950/50"
                      >
                        {activity.polyline ? (
                          <div className="w-full h-full p-2.5">
                            <RoutePreview encodedPolyline={activity.polyline} color={activityColor} />
                          </div>
                        ) : (
                          <div style={{ color: activityColor, opacity: 0.8 }}>
                            {getActivityIcon(activity.type || 'run')}
                          </div>
                        )}
                      </div>
                      
                      {/* Right: Title + Stats */}
                      <div className="flex-1 py-3.5 px-4 flex flex-col justify-center min-w-0">
                        {/* Title row */}
                        <h3 className="text-[15px] font-semibold text-white truncate leading-tight mb-1.5">
                          {activity.title}
                        </h3>
                        
                        {/* Stats row - labels on top, values below */}
                        <div className="flex items-start gap-5">
                          {stats.map((stat, idx) => (
                            <div key={idx} className="flex flex-col">
                              <span className="text-[10px] text-zinc-500 uppercase tracking-wide mb-0.5">{stat.label}</span>
                              <span 
                                className="text-[14px] font-semibold leading-tight"
                                style={{ color: activityColor }}
                              >
                                {stat.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Arrow - sleek gradient style */}
                      <div className="w-10 flex items-center justify-center">
                        <div 
                          className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                          style={{ 
                            background: `linear-gradient(135deg, ${activityColor}20, ${activityColor}40)`,
                            border: `1px solid ${activityColor}30`,
                          }}
                        >
                          <svg 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke={activityColor}
                            strokeWidth="2.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                            className="translate-x-[1px]"
                          >
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
            </div>
            
            <div className="pt-6 pb-8 text-center flex flex-col items-center gap-3">
                <span className="text-[11px] text-zinc-600">
                    {activities.length > 0 ? 'Pull to refresh' : 'Connect Strava for your activities'}
                </span>
                {/* Strava attribution - required per brand guidelines */}
                {activities.length > 0 && (
                  <img 
                    src="/assets/api_logo_pwrdBy_strava_horiz_white.png" 
                    alt="Powered by Strava"
                    style={{ height: '24px', width: 'auto' }}
                  />
                )}
            </div>
          </div>
      </div>
    </div>
  );
};
