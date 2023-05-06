import React, { useEffect, useState } from 'react';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Selection,
  Inject,
  Edit,
  Toolbar,
  Sort,
  Filter,
} from '@syncfusion/ej2-react-grids';

import axios from 'axios';
import useToken from '../hooks/useToken';
import Skeleton from 'react-loading-skeleton';
import { useTranslation } from 'react-i18next';
import { CircularProgress, Dialog, DialogContent } from '@mui/material';
import { customersData, customersGrid } from '../data/dummy';
import { Header } from '../components';

const Customers = () => {
  const selectionsettings = { persistSelection: true };
  // const toolbarOptions = ['Delete'];
  const editing = { allowDeleting: true, allowEditing: true };
  const [users, setUsers] = useState();
  const [token, setToken] = useToken();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();

  const getUsers = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL}/users`,
        {
          headers: {
            accessToken : token,
          },
        }
      );

      if (response.data.error) {
        setUsers([]);
        throw response.data.error;
      }

      if (response.status == 200) {
        setErrorMessage('');
        setUsers(response.data);
      }
    } catch (err) {
      if (err.message) {
        setErrorMessage(t("can_not_connect_to_server"));
      } else {
        setErrorMessage(t(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getUsers();
  }, []);
  return (
    <div className="mt-24">
      <div className="m-2 md:m-10 mt-24 p-2 md:p-10 bg-white rounded-3xl">
        <Dialog open={isLoading} keepMounted>
          <DialogContent className="grid grid-rows-2 justify-center items-end p-1 bg-white dark:bg-gray-700 font-bold text-center">
            <CircularProgress className="mx-auto" />
            <p>{t("is_loading")}</p>
          </DialogContent>
        </Dialog>
        <Header category="Page" title="Users" />
        <button onClick={getUsers}>test</button>
        <p>{errorMessage}</p>
        <GridComponent
          dataSource={users}
          enableHover={false}
          allowPaging
          pageSettings={{ pageCount: 5 }}
          selectionSettings={selectionsettings}
          // toolbar={toolbarOptions}
          editSettings={editing}
          allowSorting
        >
          <ColumnsDirective>
            {customersGrid.map((item, index) => (
              <ColumnDirective key={index} {...(item || <Skeleton />)} />
            ))}
          </ColumnsDirective>
          <Inject services={[Page, Selection, Toolbar, Edit, Sort, Filter]} />
        </GridComponent>
      </div>
    </div>
  );
};

export default Customers;
