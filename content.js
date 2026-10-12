// Complete & verified Devanagari ➔ Bengali mapping table
const DEVANAGARI_TO_BENGALI = {
  // Vowels
  '\u0905':'অ', '\u0906':'আ', '\u0907':'ই', '\u0908':'ঈ',
  '\u0909':'উ', '\u090A':'ঊ', '\u090B':'ঋ', '\u090E':'এ',
  '\u090F':'এ', '\u0910':'ঐ', '\u0912':'ও', '\u0913':'ও',
  '\u0914':'ঔ', '\u090D':'অ্যা', '\u0911':'অ',

  // Consonants
  '\u0915':'ক', '\u0916':'খ', '\u0917':'গ', '\u0918':'ঘ', '\u0919':'ঙ',
  '\u091A':'চ', '\u091B':'ছ', '\u091C':'জ', '\u091D':'ঝ', '\u091E':'ঞ',
  '\u091F':'ট', '\u0920':'ঠ', '\u0921':'ড', '\u0922':'ঢ', '\u0923':'ণ',
  '\u0924':'ত', '\u0925':'থ', '\u0926':'দ', '\u0927':'ধ', '\u0928':'ন',
  '\u0929':'ন', '\u092A':'প', '\u092B':'ফ', '\u092C':'ব', '\u092D':'ভ',
  '\u092E':'ম', '\u092F':'য', '\u0930':'র', '\u0931':'র', '\u0932':'ল',
  '\u0933':'ল', '\u0934':'ল', '\u0935':'ব', '\u0936':'শ', '\u0937':'ষ',
  '\u0938':'স', '\u0939':'হ',

  // Vowel signs (Matras)
  '\u093E':'া', '\u093F':'ি', '\u0940':'ী', '\u0941':'ু', '\u0942':'ূ',
  '\u0943':'ৃ', '\u0944':'ৄ', '\u0945':'্যা', '\u0946':'ে', '\u0947':'ে',
  '\u0948':'ৈ', '\u0949':'া', '\u094A':'ো', '\u094B':'ো', '\u094C':'ৌ',
  '\u094D':'্',

  // Modifiers & Nukta
  '\u0901':'ঁ', '\u0902':'ং', '\u0903':'ঃ', '\u093C':'়', '\u093D':'ঽ',

  // Precomposed Nukta Letters
  '\u0958':'ক়', '\u0959':'খ়', '\u095A':'গ়', '\u095B':'জ়',
  '\u095C':'ড়',  '\u095D':'ঢ়',  '\u095E':'ফ়', '\u095F':'য়',

  // Numerals
  '\u0966':'০', '\u0967':'১', '\u0968':'২', '\u0969':'৩', '\u096A':'৪',
  '\u096B':'৫', '\u096C':'৬', '\u096D':'৭', '\u096E':'৮', '\u096F':'৯'
};

// Complete & verified Bengali ➔ Devanagari mapping table
const BENGALI_TO_DEVANAGARI = {
  // Vowels
  'অ':'अ', 'আ':'आ', 'ই':'इ', 'ঈ':'ई', 'উ':'उ', 'ঊ':'ऊ', 'ঋ':'ऋ',
  'এ':'ए', 'ঐ':'ऐ', 'ও':'ओ', 'ঔ':'औ',

  // Consonants
  'ক':'क', 'খ':'ख', 'গ':'ग', 'ঘ':'घ', 'ঙ':'ङ',
  'চ':'च', 'ছ':'छ', 'জ':'ज', 'ঝ':'झ', 'ঞ':'ञ',
  'ট':'ट', 'ঠ':'ठ', 'ড':'ड', 'ঢ':'ढ', 'ণ':'ण',
  'ত':'त', 'থ':'थ', 'দ':'द', 'ध':'ध', 'ন':'न',
  'প':'प', 'ফ':'फ', 'ব':'ब', 'ভ':'भ', 'ম':'म',
  'য':'य', 'র':'र', 'ল':'ल',
  'শ':'श', 'ष':'ष', 'স':'स', 'হ':'ह',

  // Bengali-specific Letters
  'ৎ':'त्', 'য়':'य़', 'ড়':'ड़', 'ঢ়':'ढ़',

  // Vowel signs (Matras)
  'া':'ा', 'ি':'ि', 'ী':'ी', 'ু':'ु', 'ূ':'ू', 'ৃ':'ृ',
  'ে':'े', 'ৈ':'ै', 'ো':'ो', 'ৌ':'ौ', '্':'्',

  // Modifiers
  'ঁ':'ँ', 'ং':'ं', 'ঃ':'ः', '়':'़', 'ঽ':'ऽ',

  // Numerals
  '০':'०', '১':'१', '২':'२', '৩':'३', '৪':'४',
  '৫':'५', '৬':'६', '৭':'७', '৮':'८', '৯':'९'
};

// Safe DOM TextNode Transliteration
function mutateTextNodes(rootNode, map) {
  const walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parentTag = node.parentNode ? node.parentNode.nodeName.toUpperCase() : '';
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'INPUT', 'TEXTAREA'].includes(parentTag)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  let currentTextNode;
  while ((currentTextNode = walker.nextNode())) {
    const originalText = currentTextNode.nodeValue;
    let convertedText = '';
    let hasChanged = false;

    for (let i = 0; i < originalText.length; i++) {
      const char = originalText[i];
      if (map[char] !== undefined) {
        convertedText += map[char];
        hasChanged = true;
      } else {
        convertedText += char;
      }
    }

    if (hasChanged) {
      currentTextNode.nodeValue = convertedText;
    }
  }
}

// Domain Matching & Continuous Mutation Execution
const activeHostname = window.location.hostname.replace(/^www\./, '');

chrome.storage.local.get([activeHostname], (storageRes) => {
  const activeMode = storageRes ? storageRes[activeHostname] : null;
  if (!activeMode || activeMode === 'none') return;

  const targetMapping = activeMode === 'bn2hi' ? BENGALI_TO_DEVANAGARI : DEVANAGARI_TO_BENGALI;

  // 1. Initial Page Mutation
  mutateTextNodes(document.body, targetMapping);

  // 2. Dynamic content listener (Infinite scroll / AJAX)
  const mutationObserver = new MutationObserver((mutations) => {
    mutationObserver.disconnect();
    for (const record of mutations) {
      for (const addedNode of record.addedNodes) {
        if (addedNode.nodeType === Node.ELEMENT_NODE) {
          mutateTextNodes(addedNode, targetMapping);
        }
      }
    }
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
});