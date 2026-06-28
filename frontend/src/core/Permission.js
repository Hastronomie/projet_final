export const PERM = { READ: 1, MODIFY: 3, COMMENT: 5, OWNER: 10 };

export function permissionLabel(p) {
    const n = Number(p);
    if (n >= PERM.OWNER)   return { text: 'Propriétaire', cls: 'badge--owner'   };
    if (n >= PERM.COMMENT) return { text: 'Commentaire',  cls: 'badge--comment' };
    if (n >= PERM.MODIFY)  return { text: 'Modification', cls: 'badge--modify'  };
    return                 { text: 'Lecture',        cls: 'badge--read'    };
}