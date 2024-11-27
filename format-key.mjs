import { writeFileSync } from 'fs';

// Pega tu clave privada aquí (la que funciona en local)
const originalKey = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDCOkfIblY9UCzq\n20uRi0swC0RtCUimwx5msu8LVLHBPzT8jIt9evqPl1MgfVN1JOK6jj/pMXkiGSb6\nimoIB64QJerd6RiqrWWprAJjZRKUHStIIlGwkXaOc+p2IoAgZWc9RWDiBmDr+Cbj\nZwiCXrS7AZ3rkAEIl6GHMjLdtPMHWipKCu6okAbii46X4ysJnYzSB9I8cZ/bKDAB\nY1ag0lw77ek/meaf2PrK+S42p0WPd6x0EpdunWbBcdulfVNh2j63X2WmqE37ar+1\nguWowrfXT+W0q9dyQW6kCTtmtAfjFBfockOrrVsH5O0Ub+esAD5Tc5TGCxedXXn9\nVabBWGR9AgMBAAECggEAH17s8bNalAgjXSKi68ThFcc4G9lkReUdf652fDDHjiQw\noXrs281Vc4RYTZbYeEMHKOUpbveJ7mc8G7roAdiFtX9+Vi3cSVL86OEKuLWeQNSO\nRVYftiJkkQEpdT/AzJq8SFHwokkv9eUMmO2vGumDjPHnqSDG/fWJxi2mOBeOKllO\nT9u1/9V0fVpYA1AU6GQR60bKdDsL5u8OvNkF41sxraRZGd5ekJwd5gA7UlMnob0P\nAXe9YTKPV3G791OSgHy/MS0y5NxnlHik0mLTpZSP+byc1wa05ddV2gog9okyJ5nP\n6Q8yWTiWYZwKCuoxE4GDUmxqTe6w1h46FgpyhBVfoQKBgQDy7XBo/90AaLKwi2wr\nwvxvKLGN2drSfZmCbQdj4ESaujgJ4urAyS8UmH+YRfd5OiGiGWwWrnURD7y7J8Qm\ntu/K+bqw4AcrLjd4LGY78SXbtxt3W30mIbphcLdkzFhbydlCWnCzN4y4uVqXKgin\n0yGhDi9u5MOH+7i8ITDh75SAHQKBgQDMrfQ4XSp3FxNCHupXG+VNieE9A6uqDOWJ\n9sWnRmOpaSNkgtqugyG4ui8ETJa4RM0jO74a0GYjNW7iinGJrh7NJzGS3JHaSwiM\n3bZOkVdy340bqfa/3EXI5m/0P9G3/X2rBe3Lq+3Ov02P5K2Q+0/1qSeqQ509lv0Z\n5mjAFy8H4QKBgEkjKUvDdLMR0nKKl1eZjcydsM8nPtVOkTAOSUJNm/oFhKedVNYT\n/AO0Yf3jWr15vfSCuOMfRQmM9mJWd5y8SPeQNh/YYvAiKvsYSvNTB/Xda/yEY+pe\nDzIU8HH9f8CqxalPd0zNtaVL0LVgJ1j3nNFTZv55C1FefODPEVuEeO4VAoGAY4Y2\nWW3b5zp+L8mOkzrKPfDMZ/mv8CkDOBmZNGRCs66e+hGyueajcAqAMCv5obI6uWYk\nYy9warBhsaA14weajJEBRvMfrLCNgMmSCxQbHI1dNNVpWROHj0+VooOhu0B0acOh\nREbehIh683vzdartz3soAV+NRtRzT7O8vaLISKECgYEAwLI3vZJqOqG79QRnTL4S\nS2box0p4PI5OUfLRr4DuepN9xvW8KdbvbLR9Qj3XstNbvK/73qqih+WB7/AEVcSJ\n9qBUwlRsSWQgEmSRJ9Okk/Rl/ykLzyARK3kwM/qno/qFDEiEGH2Itj3BECdYhBTY\nA/KyfRL6bTsObvQYgRCJMYw=\n-----END PRIVATE KEY-----\n";

// Formatear la clave
const formattedKey = originalKey
  .replace(/\\n/g, '\n')
  .replace(/^"|"$/g, '');

// Guardar en un archivo
writeFileSync('formatted-key.txt', formattedKey);

console.log('Clave formateada guardada en formatted-key.txt');
