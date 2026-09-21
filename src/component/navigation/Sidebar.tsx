import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import type { NavbarItem, NavbarProps } from "../../routes/NavbarItem";
import './Sidebar.css'
import logo from '../../assets/images/logo.png'
import yellow_logo from "../../assets/images/yellow_logo.png"
import { useAuth } from "../../context/AuthContext";

export default function SideBar({ menu }: NavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const basePath = "/admin-dashboard";
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<string | null>(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const sidebarRef = useRef<HTMLElement>(null);
    const { user } = useAuth();
    const displayName = user?.username || "Admin";
    const initial = displayName.charAt(0).toUpperCase();

    const getFullPath = (path?: string) => {
        if (!path) return "";
        if (path.startsWith(basePath)) return path;
        return `${basePath}/${path}`.replace(/\/+/g, "/");
    };

    const isPathActive = (path?: string) => {
        const fullPath = getFullPath(path);
        return Boolean(fullPath) && (
            location.pathname === fullPath ||
            location.pathname.startsWith(`${fullPath}/`)
        );
    };

    const hasActiveChild = (item: NavbarItem): boolean => {
        if (!item.children) return false;
        return item.children.some((child) => isPathActive(child.path) || hasActiveChild(child));
    };

    // Auto-expand parent items based on current route
    useEffect(() => {
        const itemsToExpand = new Set<string>();

        const expandParentItems = (items: NavbarItem[]) => {
            items.forEach(item => {
                if (item.children) {
                    if (item.children.some((child) => isPathActive(child.path) || hasActiveChild(child))) {
                        itemsToExpand.add(item.name);
                    }
                    expandParentItems(item.children);
                }
            });
        };

        expandParentItems(menu);
        setExpandedItems(prev => new Set([...prev, ...itemsToExpand]));
    }, [location.pathname, menu]);

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    // Handle click outside on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMobileOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
                setIsMobileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobileOpen]);

    const toggleExpand = (itemName: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemName)) {
                newSet.delete(itemName);
            } else {
                newSet.add(itemName);
            }
            return newSet;
        });
    };

    const renderMenu = (items: NavbarItem[], depth: number = 0) => {
        return items.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.has(item.name);
            const isActive = isPathActive(item.path);
            const isParentActive = hasChildren ? hasActiveChild(item) : false;
            const isHovered = hoveredItem === item.name;

            return (
                <div key={item.name} className="relative">
                    <div
                        onClick={() => {
                            if (hasChildren) {
                                toggleExpand(item.name);
                            } else if (item.path) {
                                navigate(getFullPath(item.path));
                            }
                        }}
                        onMouseEnter={() => setHoveredItem(item.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                        className={`
                            group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer
                            transition-all duration-300 ease-out
                            transform hover:scale-[1.02] active:scale-[0.98]
                            ${isCollapsed ? 'justify-center px-2' : 'px-3'}
                            ${isActive
                                ? 'bg-yellow-500 text-gray-950 font-semibold shadow-md shadow-yellow-500/20 ring-1 ring-yellow-300'
                                : isParentActive && !isActive
                                    ? ' dark:from-yellow-900/20 dark:to-yellow-900/10 text-yellow-500 dark:text-yellow-300 border-l-4 border-yellow-500'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-800/50'
                            }
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? item.name : undefined}
                    >
                        {/* Icon with animation */}
                        <div className={`
                            relative transition-all duration-300
                            ${isActive ? 'text-gray-950' : 'text-gray-500 dark:text-gray-400'}
                            ${isCollapsed ? 'mx-auto' : ''}
                            ${isHovered && !isActive ? 'scale-110' : ''}
                        `}>
                            {Icon && (
                                typeof Icon === "string" ? (
                                    <span className="text-xl ">{Icon}</span>
                                ) : (
                                    <Icon size={20} strokeWidth={1.5} />
                                )
                            )}

                            {item.badge && (
                                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    {item.badge}
                                </span>
                            )}

                            {/* Active indicator dot for collapsed mode */}
                            {isCollapsed && isActive && (
                                <span className="absolute -right-1 -top-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
                            )}
                        </div>

                        {/* Text and expand icon */}
                        {!isCollapsed && (
                            <>
                                <span className="flex-1 text-sm font-medium truncate">
                                    {item.name}
                                </span>

                                {hasChildren && (
                                    <svg
                                        className={`
                                            w-4 h-4 transition-all duration-300 ease-out
                                            ${isExpanded ? 'rotate-90 text-yellow-500' : 'text-gray-400'}
                                        `}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                )}
                            </>
                        )}
                    </div>

                    {/* Enhanced Tooltip for collapsed mode */}
                    {isCollapsed && isHovered && !isActive && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl z-50 whitespace-nowrap animate-fadeIn">
                            <div className="absolute left-0 -ml-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
                            {item.name}
                        </div>
                    )}

                    {/* Nested Menu with enhanced animation */}
                    {hasChildren && isExpanded && !isCollapsed && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-yellow-200 dark:border-yellow-800 pl-3 overflow-hidden animate-slideDown">
                            {renderMenu(item.children!, depth + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-white dark:bg-gray-900 shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                aria-label="Open menu"
            >
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>

            {/* Mobile overlay */}
            <div
                className={`
                    fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 lg:hidden
                    ${isMobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}
                `}
                onClick={() => setIsMobileOpen(false)}
            />

            <aside
                ref={sidebarRef}
                className={`fixed lg:relative z-40 top-16 lg:top-0 h-[calc(100vh-4rem)] lg:h-screen flex flex-col
                     bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-r border-gray-200 dark:border-gray-800
                     transition-all duration-300 ease-in-out shadow-2xl lg:shadow-lg ${isCollapsed ? 'w-20' : 'w-72'} ${isMobileOpen ? 'translate-x-0'
                        : '-translate-x-full lg:translate-x-0'}`}
            >
                {/* Header with gradient effect */}
                <div className={`
                    sticky top-0 z-10
                    flex items-center justify-between
                    p-5 mb-4
                    bg-gradient-to-r from-white via-white/95 to-white/90
                    dark:from-gray-900 dark:via-gray-900/95 dark:to-gray-900/90
                    backdrop-blur-md
                    border-b border-gray-200 dark:border-gray-800
                    ${isCollapsed ? 'flex-col gap-4' : ''}
                `}>
                    {!isCollapsed ? (
                        <>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <img
                                        src={logo}
                                        alt="logo"
                                        className="h-10 w-auto object-contain transition-transform duration-300 hover:scale-105"
                                    />

                                </div>
                            </div>
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:rotate-180"
                                aria-label="Toggle sidebar"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                            </button>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <img
                                    src={yellow_logo}
                                    alt="logo"
                                    className="h-10 w-auto object-contain"
                                />
                            </div>
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:scale-110"
                                aria-label="Expand sidebar"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Menu items with scroll area */}
                <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-6">
                    {renderMenu(menu)}
                </div>

                {/* User profile section */}
                <div className="shrink-0 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50 p-3 dark:border-gray-800 dark:from-gray-900 dark:to-gray-950">
                    <div
                        onClick={() => navigate(`${basePath}/profile`)}
                        className={`group relative flex items-center gap-3 rounded-xl p-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${isCollapsed ? "justify-center" : "cursor-pointer"}`}
                        title={isCollapsed ? displayName : undefined}
                    >
                        <div className="relative shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-sm font-medium text-white shadow-lg">
                                {initial}
                            </div>
                            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900" />
                        </div>
                        {!isCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {displayName}
                                </p>
                                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                    {user?.email || "Administrator"}
                                </p>
                            </div>
                        )}
                        {!isCollapsed && (
                            <svg className="h-4 w-4 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
