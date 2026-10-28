using System.Text.RegularExpressions;

namespace NicaLogistics.Application.Common;

/// <summary>
/// Validador centralizado de la Política 2 de TI para contraseñas de NicaLogistics.
/// Requiere:
/// - Longitud mínima de 8 caracteres.
/// - Al menos una letra mayúscula (A-Z).
/// - Al menos una letra minúscula (a-z).
/// - Al menos un dígito numérico (0-9).
/// - Al menos un carácter especial (!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?).
/// </summary>
public static class PasswordPolicy
{
    private static readonly Regex HasUpperCase = new(@"[A-Z]", RegexOptions.Compiled);
    private static readonly Regex HasLowerCase = new(@"[a-z]", RegexOptions.Compiled);
    private static readonly Regex HasDigits = new(@"[0-9]", RegexOptions.Compiled);
    private static readonly Regex HasSpecialChar = new(@"[^a-zA-Z0-9]", RegexOptions.Compiled);

    public const string PolicyErrorMessage = 
        "La contraseña no cumple con la política de seguridad (Política 2): debe tener al menos 8 caracteres, e incluir al menos una letra mayúscula, una minúscula, un número y un carácter especial.";

    public static bool IsValid(string? password, out string? errorMessage)
    {
        if (string.IsNullOrWhiteSpace(password))
        {
            errorMessage = "La contraseña es requerida.";
            return false;
        }

        if (password.Length < 8)
        {
            errorMessage = "La contraseña debe contener al menos 8 caracteres (Política 2).";
            return false;
        }

        if (!HasUpperCase.IsMatch(password))
        {
            errorMessage = "La contraseña debe incluir al menos una letra mayúscula (Política 2).";
            return false;
        }

        if (!HasLowerCase.IsMatch(password))
        {
            errorMessage = "La contraseña debe incluir al menos una letra minúscula (Política 2).";
            return false;
        }

        if (!HasDigits.IsMatch(password))
        {
            errorMessage = "La contraseña debe incluir al menos un número (Política 2).";
            return false;
        }

        if (!HasSpecialChar.IsMatch(password))
        {
            errorMessage = "La contraseña debe incluir al menos un carácter especial (Política 2).";
            return false;
        }

        errorMessage = null;
        return true;
    }
}
