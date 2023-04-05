import { AppBar, Box, Button, CircularProgress, Link, TextField, Toolbar, Typography, useMediaQuery } from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { alpha, Theme, useTheme } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { actions, AppStore } from "../../store";
import { getIdType, IdType } from "../../services/id-identifier";
import { getAccountIdFromDomain } from "../../services/domain-service";
import { SupportButton } from "../hashconnect/support";
import { SupportProgress } from "../hashconnect/support-progress";
import { getNftInfo } from "../../api-clients/hedera-mirror-node-api-helper";

export const Navbar = () => {
  const searchQuery = useSelector((state: AppStore) => state.page.searchQuery);
  const isLoading = useSelector((state: AppStore) => state.page.isLoading);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Typography
          variant="h6"
          noWrap
          component="div"
        >
          <Link
            color="inherit"
            underline="hover"
            to="/"
            component={RouterLink}
          >
            NFT Explorer
          </Link>
        </Typography>
        <form
          noValidate
          onSubmit={async e => {
            e.preventDefault();
            const type = await getIdType(searchQuery);
            if (type === IdType.NFT) {
              navigate(`/collection/${searchQuery}`);
            } else if (type === IdType.NFT_SN) {
              const [id, sn] = searchQuery.split('/');
              const nftInfo = await getNftInfo(id, Number.parseInt(sn));
              navigate(`/account/${nftInfo.account_id!}`);
            } else if (type === IdType.ACCOUNT) {
              navigate(`/account/${searchQuery}`);
            } else if (type === IdType.DOMAIN) {
              const accId = await getAccountIdFromDomain(searchQuery);
              if (accId) {
                navigate(`/account/${accId}`);
              }
            }
          }}>
          <TextField
            placeholder="Domain or Id"
            type="url"
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            value={searchQuery}
            onChange={e => {
              dispatch(actions.page.setSearchQuery(e.target.value));
            }}
            sx={{
              margin: 1,
              borderRadius: theme.shape.borderRadius,
              backgroundColor: alpha(theme.palette.common.white, 0.15),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.25),
              },
              '& fieldset': {
                borderWidth: '0px',
              },
            }}
            InputProps={{
              sx: {
                borderRadius: theme.shape.borderRadius,
                borderWidth: '0px',
                color: theme.palette.common.white,
              }
            }}
          />
          <Button type="submit" sx={{
            display: 'none'
          }}></Button>
        </form>
        {isLoading && <CircularProgress color="warning" />}

        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          sx={{
            marginLeft: 'auto'
          }}
        >
          {!isSmallScreen && (
            <Box
              width="10vw"
              mr="0.5rem"
            >
              <SupportProgress />
            </Box>
          )}
          <SupportButton />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
