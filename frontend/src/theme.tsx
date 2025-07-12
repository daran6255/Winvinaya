import { extendTheme } from "@chakra-ui/react"

const disabledStyles = {
  _disabled: {
    backgroundColor: "ui.secondary",
    color: "gray.400",
    cursor: "not-allowed",
  },
}

const theme = extendTheme({
  colors: {
    ui: {
      main: "#213448",       // Dark Slate Blue
      secondary: "#547792",  // Steel Blue
      accent: "#94B4C1",     // Light Steel Blue
      light: "#ECEFCA",      // Light Greenish-Gray
      danger: "#E53E3E",     // Keeping default danger
      success: "#48BB78",    // Keeping default success
    },
  },
  components: {
    Button: {
      variants: {
        primary: {
          backgroundColor: "ui.main",
          color: "ui.light",
          _hover: {
            backgroundColor: "ui.secondary",
          },
          _disabled: {
            ...disabledStyles,
            _hover: {
              ...disabledStyles,
            },
          },
        },
        danger: {
          backgroundColor: "ui.danger",
          color: "ui.light",
          _hover: {
            backgroundColor: "#C53030",
          },
        },
      },
    },
    Tabs: {
      variants: {
        enclosed: {
          tab: {
            _selected: {
              color: "ui.main",
              borderColor: "ui.accent",
            },
          },
        },
      },
    },
  },
})

export default theme
