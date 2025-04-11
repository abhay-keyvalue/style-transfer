import filter1 from '../filters/filter_01.jpg';
import filter2 from '../filters/filter_02.jpg';
import filter3 from '../filters/filter_03.jpg';
import filter4 from '../filters/filter_04.jpg';
import filter5 from '../filters/filter_05.jpg';
import filter6 from '../filters/filter_06.jpg';
import filter7 from '../filters/filter_07.jpg';
import filter8 from '../filters/filter_08.jpg';
import filter9 from '../filters/filter_09.jpg';

export interface Filter {
  id: string;
  name: string;
  image: string;
}

export const filters: Filter[] = [
  { id: 'filter1', name: 'Van Gogh - Starry Night', image: filter1 },
  { id: 'filter2', name: 'Picasso - Cubism', image: filter2 },
  { id: 'filter3', name: 'Monet - Water Lilies', image: filter3 },
  { id: 'filter4', name: 'Kandinsky - Abstract', image: filter4 },
  { id: 'filter5', name: 'Hokusai - The Great Wave', image: filter5 },
  { id: 'filter6', name: 'Dali - Surrealism', image: filter6 },
  { id: 'filter7', name: 'Mondrian - Composition', image: filter7 },
  { id: 'filter8', name: 'Klimt - The Kiss', image: filter8 },
  { id: 'filter9', name: 'Matisse - Cut-Outs', image: filter9 },
]; 