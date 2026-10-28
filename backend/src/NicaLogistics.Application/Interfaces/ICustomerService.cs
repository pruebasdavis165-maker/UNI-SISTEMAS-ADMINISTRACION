using NicaLogistics.Application.DTOs;

namespace NicaLogistics.Application.Interfaces;

public interface ICustomerService
{
    Task<IEnumerable<CustomerSummaryDto>> GetCustomersAsync(string? search = null);
    Task<CustomerDetailDto> GetCustomerDetailAsync(Guid id);
}
