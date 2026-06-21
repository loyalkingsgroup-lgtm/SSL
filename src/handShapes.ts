
export interface HandShape {
  id: string;
  name: string;
  image: string;
  description: string;
}

export const SASL_HAND_SHAPES: HandShape[] = [
  { id: '5-hand', name: '5 HAND', image: 'https://picsum.photos/seed/sasl-5hand/300/400', description: 'Open palm with all five fingers extended.' },
  { id: '5-claw', name: '5 CLAW HND', image: 'https://picsum.photos/seed/sasl-5claw/300/400', description: 'Open palm with fingers curved like a claw.' },
  { id: 'extend-2nd', name: 'EXTEND 2ND', image: 'https://picsum.photos/seed/sasl-ext2/300/400', description: 'Index finger extended, others closed.' },
  { id: 'extend-3rd', name: 'EXTEND 3RD', image: 'https://picsum.photos/seed/sasl-ext3/300/400', description: 'Middle finger extended, others closed.' },
  { id: 'ext-pinky', name: 'EXT. PINKY', image: 'https://picsum.photos/seed/sasl-pinky/300/400', description: 'Pinky finger extended, others closed.' },
  { id: '8-hand', name: '8 HAND', image: 'https://picsum.photos/seed/sasl-8hand/300/400', description: 'Middle finger touching thumb, others extended.' },
  { id: '8-claw', name: '8 CLAW', image: 'https://picsum.photos/seed/sasl-8claw/300/400', description: '8 hand shape with fingers curved.' },
  { id: '9-hand', name: '9 HAND', image: 'https://picsum.photos/seed/sasl-9hand/300/400', description: 'Index finger touching thumb, others extended.' },
  { id: 'a-hand', name: 'A', image: 'https://picsum.photos/seed/sasl-a/300/400', description: 'Closed fist with thumb on the side.' },
  { id: 'open-a', name: 'OPEN-A(6)', image: 'https://picsum.photos/seed/sasl-opena/300/400', description: 'Closed fist with thumb extended upwards.' },
  { id: 'b-hand', name: 'B', image: 'https://picsum.photos/seed/sasl-b/300/400', description: 'Flat hand with thumb tucked across palm.' },
  { id: 'open-b', name: 'OPEN B', image: 'https://picsum.photos/seed/sasl-openb/300/400', description: 'Flat hand with thumb extended.' },
  { id: 'c-hand', name: 'C', image: 'https://picsum.photos/seed/sasl-c/300/400', description: 'Fingers and thumb curved to form a C shape.' },
  { id: 'd-hand', name: 'D', image: 'https://picsum.photos/seed/sasl-d/300/400', description: 'Index finger extended, others touching thumb in a circle.' },
  { id: 'e-hand', name: 'E', image: 'https://picsum.photos/seed/sasl-e/300/400', description: 'Fingers curled onto palm, thumb tucked under.' },
  { id: 'f-hand', name: 'F', image: 'https://picsum.photos/seed/sasl-f/300/400', description: 'Index and thumb touching in a circle, others extended.' },
  { id: 'ily-hand', name: 'ILY', image: 'https://picsum.photos/seed/sasl-ily/300/400', description: 'Pinky, index, and thumb extended (I Love You).' },
  { id: 'y-hand', name: 'Y', image: 'https://picsum.photos/seed/sasl-y/300/400', description: 'Pinky and thumb extended, others closed.' }
];
