FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy solution and project files for layer caching
COPY NicaLogistics.sln .
COPY src/NicaLogistics.Domain/*.csproj src/NicaLogistics.Domain/
COPY src/NicaLogistics.Application/*.csproj src/NicaLogistics.Application/
COPY src/NicaLogistics.Infrastructure/*.csproj src/NicaLogistics.Infrastructure/
COPY src/NicaLogistics.Api/*.csproj src/NicaLogistics.Api/

RUN dotnet restore

# Copy all source and publish
COPY src/ src/
RUN dotnet publish src/NicaLogistics.Api/NicaLogistics.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000
ENTRYPOINT ["dotnet", "NicaLogistics.Api.dll"]
