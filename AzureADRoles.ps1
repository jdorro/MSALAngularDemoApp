[CmdletBinding()]
param(
    [PSCredential] $Credential,
    [Parameter(Mandatory=$False, HelpMessage='Tenant ID (This is a GUID which represents the "Directory ID" of the AzureAD tenant into which you want to create the apps')]
    [string] $tenantId
)

<#
 This script creates the following artefacts in the Azure AD tenant.
 1) A number of App roles
 2) A set of users and assigns them to the app roles.

 Before running this script you need to install the AzureAD cmdlets as an administrator.
 For this:
 1) Run Powershell as an administrator
 2) in the PowerShell window, type: Install-Module AzureAD

 There are four ways to run this script. For more information, read the AppCreationScripts.md file in the same folder as this script.
#>
Import-Module AzureAD
$ErrorActionPreference = 'Stop'

# Create an application role of given name and description
Function CreateAppRole([string] $Name, [string] $Description)
{
    $appRole = New-Object Microsoft.Open.AzureAD.Model.AppRole
    $appRole.AllowedMemberTypes = New-Object System.Collections.Generic.List[string]
    $appRole.AllowedMemberTypes.Add("User");
    $appRole.DisplayName = $Name
    $appRole.Id = New-Guid
    $appRole.IsEnabled = $true
    $appRole.Description = $Description
    $appRole.Value = $Name;
    return $appRole
}

Function CreateUserRepresentingAppRole([string]$appName, $role, [string]$tenantName)
{
    $password = "test123456789."
    $displayName=$appName+"-"+$role.Value
    $userEmail = $displayName+"@"+$tenantName
    $nickName=$role.Value
    CreateUser -displayName $displayName -nickName $nickName -tenantName $tenantName
}

Function CreateUser([string]$displayName, [string]$nickName, [string]$tenantName)
{
    $password = "test123456789."
    $userEmail = $displayName+"@"+$tenantName
    $passwordProfile = New-Object Microsoft.Open.AzureAD.Model.PasswordProfile($password, $false, $false)
   # New-AzureADUser -DisplayName $displayName -PasswordProfile $passwordProfile -AccountEnabled $true -MailNickName $nickName -UserPrincipalName $userEmail
}

Function CreateRolesUsersAndRoleAssignments
{
<#.Description
   This function creates the
#>

    # $tenantId is the Active Directory Tenant. This is a GUID which represents the "Directory ID" of the AzureAD tenant
    # into which you want to create the apps. Look it up in the Azure portal in the "Properties" of the Azure AD.

    # Login to Azure PowerShell (interactive if credentials are not already provided:
    # you'll need to sign-in with creds enabling your to create apps in the tenant)
    if (!$Credential -and $TenantId)
    {
        $creds = Connect-AzureAD -TenantId $tenantId
    }
    else
    {
        if (!$TenantId)
        {
            $creds = Connect-AzureAD -Credential $Credential
        }
        else
        {
            $creds = Connect-AzureAD -TenantId $tenantId -Credential $Credential
        }
    }

    if (!$tenantId)
    {
        $tenantId = $creds.Tenant.Id
    }

    $tenant = Get-AzureADTenantDetail
    $tenantName =  ($tenant.VerifiedDomains | Where { $_._Default -eq $True }).Name

    # Get the user running the script
    $user = Get-AzureADUser -ObjectId $creds.Account.Id

	#------------------------------------------------------------------------------------------------------------------
    # Add application Roles

	$AdminRole = CreateAppRole -Name "Admin" -Description "Admins have all access."
	$ProductRole = CreateAppRole -Name "Product" -Description "Has productaccess."
	$UserDataRole = CreateAppRole -Name "UserData" -Description "Has user data access."
	$TodoListRole = CreateAppRole -Name "TodoList" -Description "Has Todo List access."

    $appRoles = New-Object System.Collections.Generic.List[Microsoft.Open.AzureAD.Model.AppRole]
    $appRoles.Add($AdminRole)
    $appRoles.Add($ProductRole)
    $appRoles.Add($UserDataRole)
	$appRoles.Add($TodoListRole)

	#------------------------------------------------------------------------------------------------------------------


	#------------------------------------------------------------------------------------------------------------------
	#Change the application name here!!!!!!!
	$app = Get-AzureADApplication -Filter "DisplayName eq 'MSalTest'"
	Write-Host "Attempting to add roles for app: '$($app.DisplayName)'." -BackgroundColor Black -ForegroundColor Cyan

    if ($app)
    {
        $servicePrincipal = Get-AzureADServicePrincipal -Filter "AppId eq '$($app.AppId)'"

        Set-AzureADApplication -ObjectId $app.ObjectId -AppRoles $appRoles
        Write-Host "Successfully added app roles to the app '$($app.DisplayName)'." -BackgroundColor Black -ForegroundColor Green

        $appName = $app.DisplayName

    <#    Write-Host "Creating users and assigning them to roles."

        # Create users
        # ------
        # Make sure that the user who created the application is an admin of the application
        Write-Host "Enable '$($user.DisplayName)' as an 'admin' of the application"
        $userAssignment = New-AzureADUserAppRoleAssignment -ObjectId $user.ObjectId -PrincipalId $user.ObjectId -ResourceId $servicePrincipal.ObjectId -Id $adminRole.Id

		#Creating a CAPP
		Write-Host "Adding CAPP user"
		$aCapp = CreateUserRepresentingAppRole $appName $CappRole $tenentName
		$userAssignment = New-AzureADUserAppRoleAssignment -ObjectId $aCapp.ObjectId -PrincipalId $aCapp.ObjectId -ResourceId $servicePrincipal.ObjectId -Id $CappRole.Id
		Write-Host "Created "($aCapp.UserPrincipalName)" with password 'CappUser1!'"

        # Creating a Vital
        Write-Host "Adding a Vital user"
        $aVital = CreateUserRepresentingAppRole $appName $VitalRole $tenantName
        $userAssignment = New-AzureADUserAppRoleAssignment -ObjectId $aVital.ObjectId -PrincipalId $aVital.ObjectId -ResourceId $servicePrincipal.ObjectId -Id $VitalRole.Id
        Write-Host "Created "($aVital.UserPrincipalName)" with password 'VitalUser1!'"

		# Creating a BrightBeginings
        Write-Host "Adding a Vital user"
        $aBrightBeginings = CreateUserRepresentingAppRole $appName $BrightBeginingsRole $tenantName
        $userAssignment = New-AzureADUserAppRoleAssignment -ObjectId $aBrightBeginings.ObjectId -PrincipalId $aBrightBeginings.ObjectId -ResourceId $servicePrincipal.ObjectId -Id $BrightBeginingsRole.Id
        Write-Host "Created "($aBrightBeginings.UserPrincipalName)" with password 'BrightBeginingsUser1!'"

		# Creating a FourPs
        Write-Host "Adding a FourPs user"
        $aFourPs = CreateUserRepresentingAppRole $appName $FourPsRole $tenantName
        $userAssignment = New-AzureADUserAppRoleAssignment -ObjectId $aFourPs.ObjectId -PrincipalId $aFourPs.ObjectId -ResourceId $servicePrincipal.ObjectId -Id $FourPsRole.Id
        Write-Host "Created "($aFourPs.UserPrincipalName)" with password 'FourPsUser1!'"

		# Creating a MotherDaughter
        Write-Host "Adding a MotherDaughter user"
        $aMotherDaughter = CreateUserRepresentingAppRole $appName $MotherDaughterRole $tenantName
        $userAssignment = New-AzureADUserAppRoleAssignment -ObjectId $aMotherDaughter.ObjectId -PrincipalId $aMotherDaughter.ObjectId -ResourceId $servicePrincipal.ObjectId -Id $MotherDaughterRole.Id
        Write-Host "Created "($aMotherDaughter.UserPrincipalName)" with password 'MotherDaughterUser1!'"

		# Creating a Tobacco
        Write-Host "Adding a Tobacco user"
        $aTobacco = CreateUserRepresentingAppRole $appName $TobaccoRole $tenantName
        $userAssignment = New-AzureADUserAppRoleAssignment -ObjectId $aTobacco.ObjectId -PrincipalId $aTobacco.ObjectId -ResourceId $servicePrincipal.ObjectId -Id $TobaccoRole.Id
        Write-Host "Created "($aTobacco.UserPrincipalName)" with password 'TobaccoUser1!'"

		# Creating a Fimr
        Write-Host "Adding a Fimr user"
        $aFimr = CreateUserRepresentingAppRole $appName $FimrRole $tenantName
        $userAssignment = New-AzureADUserAppRoleAssignment -ObjectId $aFimr.ObjectId -PrincipalId $aFimr.ObjectId -ResourceId $servicePrincipal.ObjectId -Id $FimrRole.Id
        Write-Host "Created "($aFimr.UserPrincipalName)" with password 'FimrUser1!'"

		# Creating a Cdpp
        Write-Host "Adding a Cdpp user"
        $aCdpp = CreateUserRepresentingAppRole $appName $CdppRole $tenantName
        $userAssignment = New-AzureADUserAppRoleAssignment -ObjectId $aCdpp.ObjectId -PrincipalId $aCdpp.ObjectId -ResourceId $servicePrincipal.ObjectId -Id $CdppRole.Id
        Write-Host "Created "($aCdpp.UserPrincipalName)" with password 'CdppUser1!'"

		# Creating a NrsAdmin
        Write-Host "Adding a NrsAdmin user"
        $aNrsAdmin = CreateUserRepresentingAppRole $appName $NrsAdminRole $tenantName
        $userAssignment = New-AzureADUserAppRoleAssignment -ObjectId $aNrsAdmin.ObjectId -PrincipalId $aNrsAdmin.ObjectId -ResourceId $servicePrincipal.ObjectId -Id $NrsAdminRole.Id
        Write-Host "Created "($aNrsAdmin.UserPrincipalName)" with password 'NrsAdminUser1!'"

		# Creating a NrsUser
        Write-Host "Adding a NrsUser user"
        $aNrsUser = CreateUserRepresentingAppRole $appName $NrsUserRole $tenantName
        $userAssignment = New-AzureADUserAppRoleAssignment -ObjectId $aNrsUser.ObjectId -PrincipalId $aNrsUser.ObjectId -ResourceId $servicePrincipal.ObjectId -Id $NrsUserRole.Id
        Write-Host "Created "($aNrsUser.UserPrincipalName)" with password 'NrsUserUser1!'"
	#>
    }
    else {
        Write-Host "Failed to add app roles to the app '($app.DisplayName)'."
    }

    Write-Host "Run the ..\\CleanupUsers.ps1 command to remove users created for this sample's application ."
}

CreateRolesUsersAndRoleAssignments -Credential $Credential -tenantId $TenantId
