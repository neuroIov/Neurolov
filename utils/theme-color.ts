"use client"

const ThemedStyles = (theme: string | undefined) => ({
    headerBackground: theme === 'light' ? "bg-gray-950 border-b" : " bg-white",
    pageBackground: theme === 'light' ? 'bg-gray-950' : 'bg-gray-100',
    textColor: theme === 'light' ? 'text-white' : 'text-black',
    subtextColor: theme === 'light' ? 'text-gray-450' : 'text-gray-600',
    borderColor: theme === 'light' ? 'border-gray-700' : 'border-gray-300',
    buttonStyles: theme === 'light' ? 'text-white border-gray-700' : 'text-black border-gray-300',
    hoverButtonStyle:{
        primary: theme === 'light' 
            ? 'bg-blue-600 hover:bg-blue-700 text-black' 
            : 'bg-blue-500 hover:bg-blue-600 text-white',
        outline: theme === 'light'
            ? 'border-gray-700 hover:bg-gray-700 text-black'
            : 'border-gray-300 hover:bg-gray-200 text-white'
    }
});
export default  ThemedStyles;