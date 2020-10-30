import { StackNavigator } from 'react-navigation';
import Login from './components/auth/login';
import Register from './components/auth/register';
import PasswordReset from './components/auth/passwordreset';
import Profile from './components/profile/index';
import Services from './components/profile/services';
import RegisterService from './components/profile/registerservice';
import Customer from './components/profile/customer'
import ViewBusiness from './components/profile/viewbusiness'
import ResultsMap from './components/profile/resultsmap'
import ChatList from './components/profile/chatlist'
import ChatDetail from './components/profile/chatdetail'
import { NavigationActions } from 'react-navigation'

const Navigator = StackNavigator({
  Home: { screen: Login},
  Register: { screen: Register},
  PasswordReset: { screen: PasswordReset},
  Profile: { screen: Profile },
  Services: { screen: Services },
  RegisterService: { screen: RegisterService },
  Customer: { screen: Customer },
  ViewBusiness: { screen: ViewBusiness },
  ResultsMap: { screen: ResultsMap },
  ChatList: { screen: ChatList },
  ChatDetail: { screen: ChatDetail },
}, {
    headerMode: 'screen',
});

export default Navigator;
