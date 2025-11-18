package seed

import (
	"fmt"
)

func PokemonCardKey(data map[string]any) (string, error) {
	return stringField(data, "tcgLandPublicId")
}

func PokemonSetKey(data map[string]any) (string, error) {
	// Remove legacy fields that are not part of the strict schema
	delete(data, "total")
	return stringField(data, "id")
}

func MTGSetKey(data map[string]any) (string, error) {
	return stringField(data, "id")
}

func MTGCardKey(data map[string]any) (string, error) {
	setID, err := stringField(data, "sId")
	if err != nil {
		return "", err
	}
	cardID, err := stringField(data, "cId")
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%s-%s", setID, cardID), nil
}

func stringField(data map[string]any, key string) (string, error) {
	raw, ok := data[key]
	if !ok {
		return "", fmt.Errorf("field %s is missing", key)
	}
	str, ok := raw.(string)
	if !ok {
		return "", fmt.Errorf("field %s is not a string", key)
	}
	if str == "" {
		return "", fmt.Errorf("field %s is empty", key)
	}
	return str, nil
}
