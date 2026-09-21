export const hasAnyModuleAccess = (userPermissions: string[], modulePrefix?: string): boolean => {
    if (!modulePrefix) return true;
    return userPermissions.some((p) => p.startsWith(`${modulePrefix}_`));
};

export const filterMenuByPermissions = (menu: any[], userPermissions: string[]): any[] => {
    return menu
        .map((item) => {
            if (item.children) {
                const filteredChildren = filterMenuByPermissions(item.children, userPermissions);
                if (filteredChildren.length === 0) return null;
                return { ...item, children: filteredChildren };
            }
            return hasAnyModuleAccess(userPermissions, item.moduleKey) ? item : null;
        })
        .filter(Boolean);
};