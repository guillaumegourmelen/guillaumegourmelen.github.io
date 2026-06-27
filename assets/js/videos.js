/**
 * Central registry of YouTube video IDs used across project pages.
 *
 * Why this file exists: project pages previously had YouTube embed URLs
 * hardcoded inline in onclick="loadVid(this,'https://www.youtube.com/embed/XXXX')"
 * attributes. That makes it easy to lose track of which video lives where,
 * and means editing a link required digging through HTML. Now every page
 * just declares which key(s) it needs (data-video-key="...") and the loader
 * in video-loader.js looks up the real URL from here.
 *
 * To update or add a video:
 *   1. Add/edit an entry below — key: 'XXXXXXXXXXX' (the 11-char YouTube ID).
 *   2. Reference it in the HTML via data-video-key="key" on the
 *      .video-placeholder element (see video-loader.js for usage).
 *
 * Keys are namespaced "page.slot" to keep multi-video pages (e.g. miruoto,
 * which has a portrait + landscape clip) unambiguous.
 */
const VIDEO_LIBRARY = {
  'colimbs.demo':        'cb1HsKfddYY',
  'submarine.demo':      'NaMhMI9PSlQ',
  'miruoto.portrait':    'db5LRZ3BhJ4',
  'miruoto.landscape':   'XdFl1PHtbGU',
  'echo.demo':           '4J2LHxepwzU',
  'teleoperation.demo':  'bMBCkF2lrp8',
};
