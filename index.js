import functions from '@google-cloud/functions-framework';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

functions.http('entry', async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {
    const data = await get_kanji(req.query.kana, req.query.n || 3);
    res.json(data);
  }
});

async function get_kanji(kana, num) {
  const uri = `https://dictionary.goo.ne.jp/srch/kanji/${kana}/m0u/`;
  const response = await fetch(encodeURI(uri));
  const body = await response.text();
  const root = parse(body);
  const els = root.querySelectorAll('.kanji .text');
  return ((els.length < num) && (kana.length > 1))
          ? get_kanji(kana.charAt(0), num)
          : random_sort(els).slice(0, num).map(el => el.text);
}

function random_sort(org) {
  const ary = org.concat();
  let a = ary.length;
  while (a) {
    const j = Math.floor( Math.random() * a);
    const t = ary[--a];
    ary[a] = ary[j];
    ary[j] = t;
  }
  return ary;
}
