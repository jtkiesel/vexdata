import axios, { AxiosRequestConfig } from 'axios';

const programs: {[key: number]: string} = {
  1: 'VRC',
  4: 'VEXU',
  41: 'VIQC'
};

const seasons: {[key: number]: string} = {
  '-4': 'Bridge Battle',
	'-3': 'Elevation',
	'-2': 'Elevation',
	'-1': 'Rings-n-Things',
	'1': 'Clean Sweep',
	'4': 'Clean Sweep',
	'7': 'Round Up',
	'10': 'Round Up',
	'73': 'Gateway',
	'76': 'Gateway',
	'85': 'Sack Attack',
	'88': 'Sack Attack',
	'92': 'Toss Up',
	'93': 'Toss Up',
	'96': 'Add It Up',
	'101': 'Highrise',
	'102': 'Skyrise',
	'103': 'Skyrise',
	'109': 'Bank Shot',
	'110': 'Nothing But Net',
	'111': 'Nothing But Net',
	'114': 'Crossover',
	'115': 'Starstruck',
	'116': 'Starstruck',
	'119': 'In the Zone',
	'120': 'In the Zone',
	'121': 'Ringmaster',
	'124': 'Next Level',
	'125': 'Turning Point',
	'126': 'Turning Point',
	'129': 'Squared Away',
	'130': 'Tower Takeover',
	'131': 'Tower Takeover'
};

const grades = [
  'All',
  'Elementary',
  'Middle School',
  'High School',
  'College'
];

export const decodeProgram = (id: number) => programs[id];
export const decodeSeason = (id: number) => seasons[id];
export const decodeGrade = (id: number) => grades[id];

export const callApi = async (url: string, config?: AxiosRequestConfig) => {
  const response = await axios(url, config);
	if (response.status < 200 || response.status > 299) {
		throw Error(response.statusText);
	}
	return response.data;
};

export default {
	decodeProgram,
	decodeSeason,
	decodeGrade,
	callApi
};
