using System.Text.RegularExpressions;

namespace NicaLogistics.Application.Common;

/// <summary>
/// Validador y normalizador centralizado de números telefónicos para NicaLogistics.
/// Cumple con la política de integridad de datos para la operación bilateral:
/// - Nicaragua (+505): Exactamente 8 dígitos numéricos (Formato: +505 8888-0000).
/// - Estados Unidos (+1): Exactamente 10 dígitos numéricos (Formato: +1 (305) 555-0199).
/// </summary>
public static class PhonePolicy
{
    public const string PolicyErrorMessage = 
        "El número telefónico debe ser válido para las operaciones oficiales: Nicaragua (+505 con exactamente 8 dígitos) o Estados Unidos (+1 con exactamente 10 dígitos).";

    /// <summary>
    /// Valida y normaliza un número de teléfono al formato institucional estándar.
    /// </summary>
    public static bool IsValid(string? phone, out string? errorMessage, out string? normalizedPhone, bool isRequired = false)
    {
        errorMessage = null;
        normalizedPhone = null;

        if (string.IsNullOrWhiteSpace(phone))
        {
            if (isRequired)
            {
                errorMessage = "El número telefónico es obligatorio.";
                return false;
            }
            return true;
        }

        var trimmed = phone.Trim();

        // Extraer únicamente los dígitos numéricos
        var onlyDigits = Regex.Replace(trimmed, @"\D", "");

        // 1. Detección de Nicaragua (+505)
        if (trimmed.StartsWith("+505") || trimmed.StartsWith("505"))
        {
            // Remover el prefijo 505
            var localDigits = onlyDigits.StartsWith("505") ? onlyDigits[3..] : onlyDigits;

            if (localDigits.Length != 8)
            {
                errorMessage = $"El número de teléfono para Nicaragua (+505) debe contener exactamente 8 dígitos numéricos. (Ingresados: {localDigits.Length})";
                return false;
            }

            normalizedPhone = $"+505 {localDigits[..4]}-{localDigits[4..]}";
            return true;
        }

        // 2. Detección de Estados Unidos (+1)
        if (trimmed.StartsWith("+1") || (trimmed.StartsWith("1") && onlyDigits.Length == 11))
        {
            var localDigits = onlyDigits.StartsWith("1") ? onlyDigits[1..] : onlyDigits;

            if (localDigits.Length != 10)
            {
                errorMessage = $"El número de teléfono para Estados Unidos (+1) debe contener exactamente 10 dígitos numéricos. (Ingresados: {localDigits.Length})";
                return false;
            }

            normalizedPhone = $"+1 ({localDigits[..3]}) {localDigits.Substring(3, 3)}-{localDigits[6..]}";
            return true;
        }

        // 3. Inferencia por longitud cuando no hay prefijo explícito
        if (onlyDigits.Length == 8)
        {
            // Asumir Nicaragua (+505)
            normalizedPhone = $"+505 {onlyDigits[..4]}-{onlyDigits[4..]}";
            return true;
        }

        if (onlyDigits.Length == 10)
        {
            // Asumir Estados Unidos (+1)
            normalizedPhone = $"+1 ({onlyDigits[..3]}) {onlyDigits.Substring(3, 3)}-{onlyDigits[6..]}";
            return true;
        }

        errorMessage = PolicyErrorMessage;
        return false;
    }
}
