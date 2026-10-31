// Every destination the shop can show, grouped into shipping regions. Client-safe (no server imports).
export type RegionId = "uae" | "gcc" | "mena" | "europe" | "uk" | "na" | "latam" | "southasia" | "eastasia" | "oceania" | "central" | "africa" | "remote";

const RAW = `
AE|United Arab Emirates|uae
SA|Saudi Arabia|gcc
KW|Kuwait|gcc
QA|Qatar|gcc
BH|Bahrain|gcc
OM|Oman|gcc
JO|Jordan|mena
LB|Lebanon|mena
IQ|Iraq|mena
IL|Israel|mena
PS|Palestine|mena
EG|Egypt|mena
LY|Libya|mena
TN|Tunisia|mena
DZ|Algeria|mena
MA|Morocco|mena
TR|Türkiye|mena
IR|Iran|mena
SY|Syria|mena
AT|Austria|europe
BE|Belgium|europe
BG|Bulgaria|europe
HR|Croatia|europe
CY|Cyprus|europe
CZ|Czechia|europe
DK|Denmark|europe
EE|Estonia|europe
FI|Finland|europe
FR|France|europe
DE|Germany|europe
GR|Greece|europe
HU|Hungary|europe
IE|Ireland|europe
IT|Italy|europe
LV|Latvia|europe
LT|Lithuania|europe
LU|Luxembourg|europe
MT|Malta|europe
NL|Netherlands|europe
PL|Poland|europe
PT|Portugal|europe
RO|Romania|europe
SK|Slovakia|europe
SI|Slovenia|europe
ES|Spain|europe
SE|Sweden|europe
IS|Iceland|europe
LI|Liechtenstein|europe
NO|Norway|europe
CH|Switzerland|europe
AD|Andorra|europe
MC|Monaco|europe
SM|San Marino|europe
VA|Vatican City|europe
GI|Gibraltar|europe
GB|United Kingdom|uk
JE|Jersey|uk
GG|Guernsey|uk
IM|Isle of Man|uk
US|United States|na
CA|Canada|na
PR|Puerto Rico|na
BM|Bermuda|na
MX|Mexico|latam
GT|Guatemala|latam
BZ|Belize|latam
SV|El Salvador|latam
HN|Honduras|latam
NI|Nicaragua|latam
CR|Costa Rica|latam
PA|Panama|latam
CO|Colombia|latam
VE|Venezuela|latam
EC|Ecuador|latam
PE|Peru|latam
BO|Bolivia|latam
PY|Paraguay|latam
UY|Uruguay|latam
AR|Argentina|latam
CL|Chile|latam
BR|Brazil|latam
GY|Guyana|latam
SR|Suriname|latam
CU|Cuba|latam
DO|Dominican Republic|latam
HT|Haiti|latam
JM|Jamaica|latam
BS|Bahamas|latam
BB|Barbados|latam
TT|Trinidad and Tobago|latam
IN|India|southasia
PK|Pakistan|southasia
BD|Bangladesh|southasia
LK|Sri Lanka|southasia
NP|Nepal|southasia
BT|Bhutan|southasia
MV|Maldives|southasia
CN|China|eastasia
HK|Hong Kong|eastasia
MO|Macao|eastasia
TW|Taiwan|eastasia
JP|Japan|eastasia
KR|South Korea|eastasia
KP|North Korea|eastasia
SG|Singapore|eastasia
MY|Malaysia|eastasia
TH|Thailand|eastasia
VN|Vietnam|eastasia
KH|Cambodia|eastasia
LA|Laos|eastasia
MM|Myanmar|eastasia
PH|Philippines|eastasia
ID|Indonesia|eastasia
BN|Brunei|eastasia
TL|Timor-Leste|eastasia
AU|Australia|oceania
NZ|New Zealand|oceania
UA|Ukraine|central
MD|Moldova|central
BY|Belarus|central
RU|Russia|central
GE|Georgia|central
AM|Armenia|central
AZ|Azerbaijan|central
KZ|Kazakhstan|central
UZ|Uzbekistan|central
KG|Kyrgyzstan|central
TJ|Tajikistan|central
TM|Turkmenistan|central
MN|Mongolia|central
AL|Albania|central
BA|Bosnia and Herzegovina|central
ME|Montenegro|central
MK|North Macedonia|central
RS|Serbia|central
XK|Kosovo|central
ZA|South Africa|africa
NG|Nigeria|africa
KE|Kenya|africa
GH|Ghana|africa
ET|Ethiopia|africa
TZ|Tanzania|africa
UG|Uganda|africa
RW|Rwanda|africa
SN|Senegal|africa
CI|Côte d'Ivoire|africa
CM|Cameroon|africa
AO|Angola|africa
MZ|Mozambique|africa
ZM|Zambia|africa
ZW|Zimbabwe|africa
NA|Namibia|africa
BW|Botswana|africa
MU|Mauritius|africa
MG|Madagascar|africa
BJ|Benin|africa
BF|Burkina Faso|africa
BI|Burundi|africa
CV|Cabo Verde|africa
CF|Central African Republic|africa
TD|Chad|africa
KM|Comoros|africa
CG|Republic of the Congo|africa
CD|DR Congo|africa
DJ|Djibouti|africa
GQ|Equatorial Guinea|africa
ER|Eritrea|africa
SZ|Eswatini|africa
GA|Gabon|africa
GM|Gambia|africa
GN|Guinea|africa
GW|Guinea-Bissau|africa
LS|Lesotho|africa
LR|Liberia|africa
MW|Malawi|africa
ML|Mali|africa
MR|Mauritania|africa
NE|Niger|africa
SC|Seychelles|africa
SL|Sierra Leone|africa
SO|Somalia|africa
SS|South Sudan|africa
SD|Sudan|africa
ST|São Tomé and Príncipe|africa
TG|Togo|africa
YE|Yemen|remote
AF|Afghanistan|remote
EH|Western Sahara|remote
FO|Faroe Islands|remote
GL|Greenland|remote
FK|Falkland Islands|remote
SH|Saint Helena|remote
PM|Saint Pierre and Miquelon|remote
WF|Wallis and Futuna|remote
NF|Norfolk Island|remote
CK|Cook Islands|remote
NU|Niue|remote
TK|Tokelau|remote
PF|French Polynesia|remote
NC|New Caledonia|remote
TC|Turks and Caicos Islands|remote
VG|British Virgin Islands|remote
VI|US Virgin Islands|remote
AI|Anguilla|remote
MS|Montserrat|remote
KY|Cayman Islands|remote
AW|Aruba|remote
CW|Curaçao|remote
SX|Sint Maarten|remote
BQ|Caribbean Netherlands|remote
GP|Guadeloupe|remote
MQ|Martinique|remote
BL|Saint Barthélemy|remote
MF|Saint Martin|remote
GF|French Guiana|remote
YT|Mayotte|remote
RE|Réunion|remote
GU|Guam|remote
AS|American Samoa|remote
MP|Northern Mariana Islands|remote
PG|Papua New Guinea|remote
FJ|Fiji|remote
SB|Solomon Islands|remote
VU|Vanuatu|remote
WS|Samoa|remote
TO|Tonga|remote
KI|Kiribati|remote
TV|Tuvalu|remote
NR|Nauru|remote
PW|Palau|remote
FM|Micronesia|remote
MH|Marshall Islands|remote
AG|Antigua and Barbuda|remote
DM|Dominica|remote
GD|Grenada|remote
KN|Saint Kitts and Nevis|remote
LC|Saint Lucia|remote
VC|Saint Vincent and the Grenadines|remote
`;

export type Country = { code: string; name: string; region: RegionId };
export const COUNTRY_LIST: Country[] = RAW.trim().split("\n").map((l) => { const [code, name, region] = l.split("|"); return { code, name, region: region as RegionId }; });
export const COUNTRIES: [string, string][] = [...COUNTRY_LIST].sort((a, b) => (a.code === "AE" ? -1 : b.code === "AE" ? 1 : a.name.localeCompare(b.name))).map((c) => [c.code, c.name]);
export const countryName = (c: string) => COUNTRY_LIST.find((x) => x.code === c)?.name ?? c;

/**
 * Destinations switched off by default. Comprehensively sanctioned places (Cuba, Iran, North Korea, Syria), plus Russia and
 * Belarus where courier services and payment providers are restricted. Editable in Admin → Settings. Regions that cannot be
 * told apart by country code (Crimea, Donetsk, Luhansk) are excluded in the Terms of Sale.
 */
export const DEFAULT_BLOCKED = ["CU", "IR", "KP", "SY", "RU", "BY"];
