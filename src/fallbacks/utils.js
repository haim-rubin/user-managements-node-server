export const mergeTemplates = ({ templates, defaultTemplates }) => {
    const merged =
        templates
        ? (
            Object
                .entries(defaultTemplates)
                .map(([key, value]) => ({
                    [key]: (
                        templates[key] === false
                        ? false
                        : (
                            templates[key]
                            ? templates[key]
                            : value
                            )
                    )
                }))
                .arrayPropToObject()
        )
        : {
            activation: false,
            approved: false,
            notify: false
        }
   return merged
}