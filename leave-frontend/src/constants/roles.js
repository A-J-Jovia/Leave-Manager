export const ROLES = ['Principal', 'HOD', 'Professor', 'Student'];

const [PRINCIPAL, HOD, PROFESSOR, STUDENT] = ROLES;

export const NEXT_APPROVER = {
  [STUDENT]: PROFESSOR,
  [PROFESSOR]: HOD,
  [HOD]: PRINCIPAL,
};
