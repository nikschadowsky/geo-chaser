export const useMenu = () => {
    const isMenuOpen = useState<boolean>('isMenuOpen', () => false)

    const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value
    const openMenu = () => {
        console.log(isMenuOpen.value)
        return isMenuOpen.value = true;
    }
    const closeMenu = () => isMenuOpen.value = false

    return {isMenuOpen, toggleMenu, openMenu, closeMenu}
}