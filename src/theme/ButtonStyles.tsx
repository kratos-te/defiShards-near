const depositButtonColor = {
  background: 'linear-gradient(#DEFFF4, #10B981)'
}

const connectButtonColor = {
  background: 'linear-gradient(#81EBA1, #2AE4FF)'
}
const connectButtonColorDark = {
  background: 'linear-gradient(162deg, rgb(1 168 159) 9.4%, rgb(157 251 173) 78.4%)'
}

const withdrawButtonColor = {
  background: 'linear-gradient(#76DEFF, #00C2FF)'
}

const primaryButtonColor = {
  background: 'linear-gradient(360deg, #9A3FF4 0%, #D5B5FF 122.97%)'
}

const secondaryButtonColor = {
  background: 'linear-gradient(360deg, #9CA3AF 0%, #E5E7EB 122.97%)'
}

const depositButtonHoverColor = {
  background: 'linear-gradient(#10B981, #DEFFF4)'
}

const withdrawButtonHoverColor = {
  background: 'linear-gradient(#00C2FF, #76DEFF)'
}

const primaryButtonHoverColor = {
  background: 'linear-gradient(180deg, #9A3FF4 0%, #D5B5FF 122.97%)'
}

const secondaryButtonHoverColor = {
  background: 'linear-gradient(180deg, #E5E7EB 0%, #9CA3AF 122.97%)'
}

const connectButtonHoverColor = {
  background: 'linear-gradient(#2AE4FF, #81EBA1)'
}
const connectButtonHoverColorDark = {
  background: 'linear-gradient(-21deg, rgb(1 168 159) 9.4%, rgb(157 251 173) 78.4%)'
}

const disableStyle = {
  background: 'linear-gradient(#E5E7EB, #ACACAC)'
}

export const depositButtonStyle = {
  ...depositButtonColor,
  color: 'white',
  _hover: {
    ...depositButtonHoverColor
  },
  _disabled: {
    ...disableStyle,
    _hover: {
      ...disableStyle
    }
  }
}

export const withdrawButtonStyle = {
  ...withdrawButtonColor,
  color: 'white',
  _hover: {
    ...withdrawButtonHoverColor
  },
  _disabled: {
    ...disableStyle,
    _hover: {
      ...disableStyle
    }
  }
}

export const primaryButtonStyle = {
  ...primaryButtonColor,
  color: 'white',
  _hover: {
    ...primaryButtonHoverColor
  },
  _disabled: {
    ...disableStyle,
    _hover: {
      ...disableStyle
    }
  }
}

export const secondaryButtonStyle = {
  ...secondaryButtonColor,
  color: 'white',
  _hover: {
    ...secondaryButtonHoverColor
  },
  _disabled: {
    ...disableStyle,
    _hover: {
      ...disableStyle
    }
  }
}


export const connectButtonStyle = {
  ...connectButtonColor,
  color: 'white',
  _hover: {
    ...connectButtonHoverColor
  },
  _disabled: {
    ...disableStyle,
    _hover: {
      ...disableStyle
    }
  }
}


export const connectButtonStyleDark = {
  ...connectButtonColorDark,
  color: 'white',
  _hover: {
    ...connectButtonHoverColorDark
  },
  _disabled: {
    ...disableStyle,
    _hover: {
      ...disableStyle
    }
  }
}
