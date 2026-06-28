import { IPMATSection } from '../types';

export const IB_SUBJECTS = [
  { code: 'math', name: 'Mathematics AI HL', type: 'ibdp' },
  { code: 'eco', name: 'Economics HL', type: 'ibdp' },
  { code: 'bm', name: 'Business Management HL', type: 'ibdp' },
  { code: 'eng', name: 'English SL', type: 'ibdp' },
  { code: 'hindi', name: 'Hindi SL', type: 'ibdp' },
  { code: 'ess', name: 'ESS SL', type: 'ibdp' },
  { code: 'ipmat', name: 'IPMAT', type: 'other' }
];

export const SUBJECT_MAP: Record<string, string> = {
  'math': 'Mathematics AI HL',
  'eco': 'Economics HL',
  'bm': 'Business Management HL',
  'eng': 'English SL',
  'hindi': 'Hindi SL',
  'ess': 'ESS SL',
  'ipmat': 'IPMAT',
};

export const IPMAT_SYLLABUS: IPMATSection[] = [
  {
    code: 'verbal',
    title: 'Verbal Ability',
    chapters: [
      { id: 'rc', name: 'Reading Comprehension' },
      { id: 'sc', name: 'Sentence Completion' },
      { id: 'vocab', name: 'Vocabulary' },
      { id: 'scorrection', name: 'Sentence Correction' },
      { id: 'parajumbles', name: 'Parajumbles' },
      { id: 'incorrect_word', name: 'Incorrect Word' },
      { id: 'paracompletion', name: 'Paracompletion' },
      { id: 'conv_analysis', name: 'Conversation Analysis' }
    ]
  },
  {
    code: 'di',
    title: 'Data Interpretation',
    chapters: [
      { id: 'tabular', name: 'Tabular Data' },
      { id: 'bar_graphs', name: 'Bar Graphs' }
    ]
  },
  {
    code: 'number_sys',
    title: 'Number System',
    chapters: [
      { id: 'remainder', name: 'Remainder' },
      { id: 'divisibility', name: 'Divisibility Rules' },
      { id: 'factorisation', name: 'Factorisation' },
      { id: 'misc_num', name: 'Miscellaneous' },
      { id: 'integral_sol', name: 'Integral Solutions' },
      { id: 'hcf_lcm', name: 'HCF & LCM' },
      { id: 'unit_digit', name: 'Unit Digit' }
    ]
  },
  {
    code: 'lr',
    title: 'Logical Reasoning',
    chapters: [
      { id: 'arrangements', name: 'Arrangements' },
      { id: 'tournaments', name: 'Tournaments' },
      { id: 'weights', name: 'Weights' }
    ]
  },
  {
    code: 'arithmetic',
    title: 'Arithmetic',
    chapters: [
      { id: 'tsd', name: 'Time, Speed & Distance' },
      { id: 'ratio', name: 'Ratio, Proportion & Variation' },
      { id: 'mmm', name: 'Mean, Median & Mode' },
      { id: 'interest', name: 'Simple & Compound Interest' },
      { id: 'profit_loss', name: 'Profit & Loss' },
      { id: 'time_work', name: 'Time & Work' },
      { id: 'mixture', name: 'Mixture & Alligation' }
    ]
  },
  {
    code: 'modern_maths',
    title: 'Modern Maths',
    chapters: [
      { id: 'logarithms', name: 'Logarithms' },
      { id: 'p_and_c', name: 'Permutation & Combination' },
      { id: 'set_theory', name: 'Set Theory' },
      { id: 'matrices', name: 'Matrices & Determinants' },
      { id: 'probability', name: 'Probability' },
      { id: 'binomial', name: 'Binomial Theorem' }
    ]
  },
  {
    code: 'algebra',
    title: 'Algebra',
    chapters: [
      { id: 'progression', name: 'Progression & Series' },
      { id: 'modulus', name: 'Modulus' },
      { id: 'polynomials', name: 'Polynomials' },
      { id: 'functions', name: 'Functions' },
      { id: 'linear_eq', name: 'Linear Equation' },
      { id: 'inequalities', name: 'Inequalities' },
      { id: 'indices', name: 'Indices' },
      { id: 'identities', name: 'Identities' },
      { id: 'min_max', name: 'Minima & Maxima' }
    ]
  },
  {
    code: 'geometry',
    title: 'Geometry',
    chapters: [
      { id: 'circle', name: 'Circle' },
      { id: 'triangles', name: 'Triangles' },
      { id: 'trig', name: 'Trigonometry' },
      { id: 'lines', name: 'Straight Lines' },
      { id: 'quadrilaterals', name: 'Quadrilaterals' },
      { id: 'conics', name: 'Conic Sections' },
      { id: 'solids', name: 'Solids' },
      { id: 'polygons', name: 'Polygons' }
    ]
  }
];

export const PRIORITY_COLORS = {
  low: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  medium: { bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  high: { bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' }
};
