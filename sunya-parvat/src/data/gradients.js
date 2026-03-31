/* 
  Mountain image placeholder gradients.
  Replace with real photography for production.
*/

export const mountainGradients = {
  roopkund: `radial-gradient(ellipse at 50% 80%, #1a1208 0%, #0d1520 40%, #080e18 100%)`,
  "valley-of-flowers": `radial-gradient(ellipse at 50% 60%, #0d1a0d 0%, #0a1510 50%, #080e0d 100%)`,
  kedarkantha: `radial-gradient(ellipse at 50% 70%, #0d1520 0%, #151f2e 40%, #0a0d14 100%)`,
  hampta: `radial-gradient(ellipse at 50% 60%, #1a1208 0%, #1a1510 50%, #0a0a08 100%)`,
  brahmatal: `radial-gradient(ellipse at 50% 60%, #0d1a1a 0%, #0a1520 50%, #060c14 100%)`,
  hero: `radial-gradient(ellipse at 50% 90%, #1a1005 0%, #0d1520 45%, #050810 100%)`,
  about: `radial-gradient(ellipse at 50% 70%, #12100a 0%, #0d1520 50%, #080a10 100%)`,
};

export const getGradient = (key) => mountainGradients[key] || mountainGradients.hero;
