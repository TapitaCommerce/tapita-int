import { redirect } from "@remix-run/node";
import { useNavigate, useSubmit } from "@remix-run/react";
import { ActionList, Avatar, Frame, Icon, Text, TopBar } from "@shopify/polaris";
import { AnalyticsBarHorizontalMinor, QuestionMarkMajor, ArrowRightMinor } from "@shopify/polaris-icons";
import { useCallback, useState } from "react";
import { logout } from "~/server/auth.server";

export default function DefaultLayout({ children, handleLogout }) {
    const navigate = useNavigate();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSecondaryMenuOpen, setIsSecondaryMenuOpen] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    const toggleIsUserMenuOpen = useCallback(
      () => setIsUserMenuOpen((isUserMenuOpen) => !isUserMenuOpen),
      [],
    );
  
    const toggleIsSecondaryMenuOpen = useCallback(
      () => setIsSecondaryMenuOpen((isSecondaryMenuOpen) => !isSecondaryMenuOpen),
      [],
    );
  
    const handleSearchResultsDismiss = useCallback(() => {
      setIsSearchActive(false);
      setSearchValue('');
    }, []);
  
    const handleSearchChange = useCallback((value) => {
      setSearchValue(value);
      setIsSearchActive(value.length > 0);
    }, []);
  
    const handleNavigationToggle = useCallback(() => {
      console.log('toggle navigation visibility');
    }, []);
  
    const logo = {
      width: 124,
      topBarSource:
        'https://cdn.shopify.com/s/files/1/0446/6937/files/jaded-pixel-logo-color.svg?6215648040070010999',
      url: '/',
      accessibilityLabel: 'Jaded Pixel',
    };
  
    const userMenuMarkup = (
      <TopBar.UserMenu
        actions={[
          {
            items: [{ content: 'Admin Management', icon: AnalyticsBarHorizontalMinor, onAction: () => navigate('/admin/management') }],
          },
          {
            items: [{ content: 'Logout', icon: ArrowRightMinor, onAction: () => handleLogout() }],
          },
        ]}
        name="Dharma"
        initials="D"
        open={isUserMenuOpen}
        onToggle={toggleIsUserMenuOpen}
      />
    );
  
    const searchResultsMarkup = (
      <ActionList
        items={[{content: 'Shopify help center'}, {content: 'Community forums'}]}
      />
    );
  
    const searchFieldMarkup = (
      <TopBar.SearchField
        onChange={handleSearchChange}
        value={searchValue}
        placeholder="Search"
        showFocusBorder
      />
    );
  
    const secondaryMenuMarkup = (
      <TopBar.Menu
        activatorContent={
          <span>
            <Icon source={QuestionMarkMajor} />
            <Text as="span" visuallyHidden>
              Secondary menu
            </Text>
          </span>
        }
        open={isSecondaryMenuOpen}
        onOpen={toggleIsSecondaryMenuOpen}
        onClose={toggleIsSecondaryMenuOpen}
        actions={[
          {
            items: [{content: 'Community forums'}],
          },
        ]}
      />
    );
  
    const topBarMarkup = (
      <TopBar
        showNavigationToggle
        userMenu={userMenuMarkup}
        secondaryMenu={secondaryMenuMarkup}
        searchResultsVisible={isSearchActive}
        searchField={searchFieldMarkup}
        searchResults={searchResultsMarkup}
        onSearchResultsDismiss={handleSearchResultsDismiss}
        onNavigationToggle={handleNavigationToggle}
      />
    );
  
    return (
        <Frame topBar={topBarMarkup} logo={logo}> 
          {children}
        </Frame>
    );
  }