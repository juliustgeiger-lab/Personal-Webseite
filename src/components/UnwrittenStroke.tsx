"use client";

// Hand-crafted cursive "unwritten" written in three strokes — the order a
// real hand would use:
//   1. main stroke: lead-in → u → n → w → r → i → t → t → e → n
//   2. crossbar over both t's
//   3. i-dot
// Each stroke is its own <path>, so the lifts between them are real lifts
// (not rendered ink waiting to be revealed). pathLength=100 normalises the
// dasharray math regardless of each path's true length.

export default function UnwrittenStroke() {
  return (
    <svg
      className="uw-svg"
      viewBox="0 0 1100 320"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        className="uw-segment uw-main"
        pathLength="100"
        d="M 88 96
           C 102 110, 116 122, 130 130
           C 117 178, 117 220, 152 220
           C 175 220, 187 200, 195 175
           C 202 142, 210 128, 218 130
           C 207 178, 207 220, 240 220
           C 262 220, 270 200, 277 175
           C 284 144, 293 128, 312 130
           C 304 178, 304 220, 334 220
           C 354 220, 362 200, 368 178
           C 372 158, 380 144, 390 138
           C 380 178, 380 220, 416 220
           C 438 220, 449 195, 458 160
           C 452 192, 452 220, 490 220
           C 514 220, 526 195, 534 160
           C 540 144, 550 132, 562 130
           C 552 178, 552 220, 583 220
           C 600 220, 608 200, 614 192
           C 619 188, 625 196, 628 192
           C 631 178, 628 144, 638 132
           C 648 130, 660 130, 672 130
           C 660 178, 660 220, 688 220
           C 705 220, 713 200, 720 175
           C 724 144, 727 130, 734 130
           C 748 110, 765 86, 780 68
           C 794 50, 808 46, 818 50
           C 826 54, 830 64, 825 78
           C 820 105, 825 146, 825 180
           C 826 206, 836 220, 858 220
           C 878 220, 884 200, 889 178
           C 896 148, 911 116, 925 88
           C 940 62, 956 52, 968 56
           C 977 60, 982 72, 977 84
           C 972 108, 978 148, 978 180
           C 980 206, 988 220, 1010 220
           C 1030 220, 1036 200, 1041 178
           C 1046 162, 1052 152, 1059 145
           C 1070 138, 1080 146, 1083 158
           C 1086 168, 1078 178, 1067 178
           C 1058 178, 1054 198, 1062 215
           C 1078 222, 1090 207, 1095 188"
      />
      <path
        className="uw-segment uw-cross"
        pathLength="100"
        d="M 762 80 C 808 76, 894 72, 940 76"
      />
      <path
        className="uw-segment uw-dot"
        pathLength="100"
        d="M 686 96 L 692 94"
      />
    </svg>
  );
}
